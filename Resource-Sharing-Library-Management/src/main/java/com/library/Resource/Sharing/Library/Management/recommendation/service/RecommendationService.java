package com.library.Resource.Sharing.Library.Management.recommendation.service;

import com.library.Resource.Sharing.Library.Management.dto.response.author.AuthorSummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.recommendation.config.RecommendationProperties;
import com.library.Resource.Sharing.Library.Management.recommendation.dto.RecommendedResourceDto;
import com.library.Resource.Sharing.Library.Management.recommendation.model.SparseVector;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.repository.BookRepository;
import com.library.Resource.Sharing.Library.Management.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookRepository bookRepository;
    private final TfIdfService tfIdfService;
    private final UserPreferenceService userPreferenceService;
    private final NetworkRecommendationService networkRecommendationService;
    private final RecommendationProperties properties;
    private final StorageService storageService;

    @PostConstruct
    public void init() {
        try {
            refreshCache();
        } catch (Exception e) {
            log.warn("Initial recommendation cache training deferred: {}", e.getMessage());
        }
    }

    /**
     * Retrains the in-memory TF-IDF corpus vectors from the active catalog.
     */
    public synchronized void refreshCache() {
        List<Book> currentBooks = bookRepository.findAllCurrentBooksWithDetails();
        tfIdfService.trainCorpus(currentBooks);
        log.info("Successfully trained TF-IDF corpus with {} resources.", currentBooks.size());
    }

    @org.springframework.context.event.EventListener
    public void onBookChange(com.library.Resource.Sharing.Library.Management.recommendation.event.BookChangeEvent event) {
        log.debug("Book change detected (action={}, id={}), invalidating recommendation cache.", event.action(), event.bookId());
        refreshCache();
    }

    /**
     * Generates personalized hybrid recommendations for the authenticated user.
     */
    public List<RecommendedResourceDto> getPersonalizedRecommendations(Long userId, int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), properties.getMaxLimit());

        List<Book> allBooks = bookRepository.findAllCurrentBooksWithDetails();
        if (allBooks == null || allBooks.isEmpty()) {
            return Collections.emptyList();
        }

        UserProfile userProfile = userPreferenceService.buildUserProfile(userId);

        // Check for Cold-Start User (No interaction history or network connections)
        if (!userProfile.hasActivity()) {
            return handleColdStartRecommendations(allBooks, boundedLimit);
        }

        // Rank candidate resources using the hybrid formula
        List<ScoredResource> scoredList = new ArrayList<>();
        Set<Long> excludedIds = userProfile.getExcludedBookIds();

        double maxCategoryAffinity = userProfile.getCategoryAffinities().values().stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(1.0);

        for (Book book : allBooks) {
            // Exclude resources user has already borrowed, saved, bookmarked, or rated
            if (excludedIds.contains(book.getBookId())) {
                continue;
            }

            SparseVector bookVector = tfIdfService.getOrGenerateVector(book);

            // 1. Content-based TF-IDF cosine similarity against composite user interest vector
            double contentSim = tfIdfService.computeSimilarity(userProfile.getInterestVector(), bookVector);

            // 2. User category preference match (normalized 0.0 to 1.0)
            double userPrefMatch = 0.0;
            if (book.getCategory() != null && userProfile.getCategoryAffinities().containsKey(book.getCategory().trim())) {
                userPrefMatch = userProfile.getCategoryAffinities().get(book.getCategory().trim()) / maxCategoryAffinity;
            }

            // 3. Network relevance score (followed author & community peer activity)
            double networkScore = networkRecommendationService.computeNetworkScore(book, userProfile);

            // 4. Popularity adjustment (average rating score, max 5.0)
            double popularityScore = (book.getAverageRating() != null ? book.getAverageRating() : 3.0) / 5.0;

            // 5. Freshness adjustment (recency decay over 30 days)
            double freshnessScore = calculateFreshness(book.getCreatedAt());

            // Dynamic weight normalization based on available signals
            double wContent = properties.getContentWeight();
            double wPref = properties.getPreferenceWeight();
            double wNet = properties.getNetworkWeight();
            double wPop = properties.getPopularityWeight();
            double wFresh = properties.getFreshnessWeight();

            // If network signals don't exist for this candidate, redistribute network weight
            if (networkScore <= 0.0) {
                double remaining = wContent + wPref + wPop + wFresh;
                wContent = wContent / remaining;
                wPref = wPref / remaining;
                wPop = wPop / remaining;
                wFresh = wFresh / remaining;
                wNet = 0.0;
            }

            double hybridScore = (wContent * contentSim)
                    + (wPref * userPrefMatch)
                    + (wNet * networkScore)
                    + (wPop * popularityScore)
                    + (wFresh * freshnessScore);

            // Generate explainable reason based on winning signal
            String reason = determinePersonalizedReason(book, userProfile, contentSim, userPrefMatch, networkScore);
            String signalType = determineSignalType(contentSim, userPrefMatch, networkScore);
            List<String> matchedTerms = tfIdfService.findDominantSharedTerms(userProfile.getInterestVector(), bookVector, 3);

            scoredList.add(new ScoredResource(book, hybridScore, reason, signalType, matchedTerms));
        }

        // If all available items were excluded (very active user with sparse catalog), fallback gracefully
        if (scoredList.isEmpty()) {
            return handleFallbackRecommendations(allBooks, boundedLimit);
        }

        // Sort descending by hybrid score
        scoredList.sort((a, b) -> Double.compare(b.score, a.score));

        return scoredList.stream()
                .limit(boundedLimit)
                .map(this::toRecommendedDto)
                .toList();
    }

    /**
     * Recommends resources similar to a selected resource using TF-IDF & Cosine Similarity.
     */
    public List<RecommendedResourceDto> getSimilarResources(Long bookId, int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), properties.getMaxLimit());

        Book targetBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + bookId));

        List<Book> candidates = bookRepository.findAllCurrentBooksWithDetails();
        SparseVector targetVector = tfIdfService.getOrGenerateVector(targetBook);

        List<ScoredResource> scoredList = new ArrayList<>();

        for (Book candidate : candidates) {
            if (Objects.equals(candidate.getBookId(), targetBook.getBookId())) {
                continue;
            }

            SparseVector candidateVector = tfIdfService.getOrGenerateVector(candidate);
            double similarity = tfIdfService.computeSimilarity(targetVector, candidateVector);

            // Boost if sharing same category or creator
            if (candidate.getCategory() != null && candidate.getCategory().equalsIgnoreCase(targetBook.getCategory())) {
                similarity = Math.min(1.0, similarity + 0.10);
            }
            if (candidate.getAuthor() != null && targetBook.getAuthor() != null
                    && Objects.equals(candidate.getAuthor().getAuthorId(), targetBook.getAuthor().getAuthorId())) {
                similarity = Math.min(1.0, similarity + 0.15);
            }

            // Find shared topical keywords
            List<String> sharedTerms = tfIdfService.findDominantSharedTerms(targetVector, candidateVector, 3);

            String reason;
            if (candidate.getAuthor() != null && targetBook.getAuthor() != null
                    && Objects.equals(candidate.getAuthor().getAuthorId(), targetBook.getAuthor().getAuthorId())) {
                reason = "Also authored by " + targetBook.getAuthor().getName();
            } else if (!sharedTerms.isEmpty()) {
                reason = "Similar topics in " + String.join(", ", sharedTerms);
            } else if (candidate.getCategory() != null) {
                reason = "Shared focus in " + candidate.getCategory();
            } else {
                reason = "Content-based thematic match";
            }

            scoredList.add(new ScoredResource(candidate, similarity, reason, "CONTENT_SIMILARITY", sharedTerms));
        }

        scoredList.sort((a, b) -> Double.compare(b.score, a.score));

        return scoredList.stream()
                .limit(boundedLimit)
                .map(this::toRecommendedDto)
                .toList();
    }

    /**
     * Returns trending resources ranked by community ratings, downloads, and freshness.
     */
    public List<RecommendedResourceDto> getTrendingResources(int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), properties.getMaxLimit());
        List<Book> trending = bookRepository.findTrendingBooks();

        return trending.stream()
                .limit(boundedLimit)
                .map(book -> {
                    double rating = book.getAverageRating() != null ? book.getAverageRating() : 4.5;
                    String reason = String.format("Top-rated in academic repository (%.1f★)", rating);
                    return toRecommendedDto(new ScoredResource(book, rating / 5.0, reason, "TRENDING", Collections.emptyList()));
                })
                .toList();
    }

    /**
     * Returns network-derived recommendations based on followed authors and community peers.
     */
    public List<RecommendedResourceDto> getNetworkRecommendations(Long userId, int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), properties.getMaxLimit());
        UserProfile userProfile = userPreferenceService.buildUserProfile(userId);

        List<Book> allBooks = bookRepository.findAllCurrentBooksWithDetails();
        List<ScoredResource> scoredList = new ArrayList<>();

        for (Book book : allBooks) {
            double netScore = networkRecommendationService.computeNetworkScore(book, userProfile);
            if (netScore > 0.0) {
                String reason;
                if (networkRecommendationService.isAuthoredByFollowedCreator(book, userProfile)) {
                    reason = "Published by faculty you follow: " + (book.getAuthor() != null ? book.getAuthor().getName() : "Faculty");
                } else {
                    reason = "Popular among members of your active study circles";
                }
                scoredList.add(new ScoredResource(book, netScore, reason, "NETWORK_FOLLOW", Collections.emptyList()));
            }
        }

        if (scoredList.isEmpty()) {
            return getTrendingResources(boundedLimit);
        }

        scoredList.sort((a, b) -> Double.compare(b.score, a.score));

        return scoredList.stream()
                .limit(boundedLimit)
                .map(this::toRecommendedDto)
                .toList();
    }

    /**
     * Returns recommendations within a specific category.
     */
    public List<RecommendedResourceDto> getRecommendationsByCategory(String category, int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), properties.getMaxLimit());
        List<Book> books = bookRepository.findByCategoryIgnoreCase(category);

        if (books.isEmpty()) {
            return getTrendingResources(boundedLimit);
        }

        return books.stream()
                .limit(boundedLimit)
                .map(book -> {
                    String reason = "Featured resource in " + (book.getCategory() != null ? book.getCategory() : category);
                    return toRecommendedDto(new ScoredResource(book, 0.85, reason, "CATEGORY_MATCH", Collections.emptyList()));
                })
                .toList();
    }

    // --- Helper Methods ---

    private List<RecommendedResourceDto> handleColdStartRecommendations(List<Book> allBooks, int limit) {
        List<ScoredResource> scored = new ArrayList<>();
        for (Book book : allBooks) {
            double popularity = (book.getAverageRating() != null ? book.getAverageRating() : 3.5) / 5.0;
            double freshness = calculateFreshness(book.getCreatedAt());
            double score = (0.60 * popularity) + (0.40 * freshness);

            String reason = (popularity >= 0.9)
                    ? "Essential scholarly monograph with highest peer ratings"
                    : "Recently inducted into the library vault";

            scored.add(new ScoredResource(book, score, reason, "COLD_START", Collections.emptyList()));
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        return scored.stream()
                .limit(limit)
                .map(this::toRecommendedDto)
                .toList();
    }

    private List<RecommendedResourceDto> handleFallbackRecommendations(List<Book> allBooks, int limit) {
        return allBooks.stream()
                .limit(limit)
                .map(book -> toRecommendedDto(new ScoredResource(book, 0.75, "Popular throughout the institutional library", "TRENDING", Collections.emptyList())))
                .toList();
    }

    private double calculateFreshness(LocalDateTime createdAt) {
        if (createdAt == null) {
            return 0.5;
        }
        long daysOld = Math.max(0, Duration.between(createdAt, LocalDateTime.now()).toDays());
        // Exponential decay over 60 days
        return Math.exp(-daysOld / 30.0);
    }

    private String determinePersonalizedReason(Book book, UserProfile profile, double contentSim, double prefMatch, double netScore) {
        if (netScore >= 0.8 && networkRecommendationService.isAuthoredByFollowedCreator(book, profile)) {
            return "From followed creator " + (book.getAuthor() != null ? book.getAuthor().getName() : "Faculty");
        }
        if (contentSim >= 0.35) {
            return "Matches your research reading profile";
        }
        if (prefMatch >= 0.5 && book.getCategory() != null) {
            return "Top pick in your favorite field: " + book.getCategory();
        }
        if (netScore >= 0.3) {
            return "Recommended within your academic study circles";
        }
        if (book.getAverageRating() != null && book.getAverageRating() >= 4.7) {
            return String.format("Highly acclaimed by scholars (%.1f★)", book.getAverageRating());
        }
        return "Personalized recommendation for your curriculum";
    }

    private String determineSignalType(double contentSim, double prefMatch, double netScore) {
        if (netScore >= 0.8) return "NETWORK_FOLLOW";
        if (contentSim >= 0.35) return "CONTENT_SIMILARITY";
        if (prefMatch >= 0.5) return "USER_PREFERENCE";
        if (netScore > 0.0) return "COMMUNITY_POPULAR";
        return "TRENDING";
    }

    private RecommendedResourceDto toRecommendedDto(ScoredResource sr) {
        Book b = sr.book;

        AuthorSummaryResponse author = null;
        if (b.getAuthor() != null) {
            author = AuthorSummaryResponse.builder()
                    .authorId(b.getAuthor().getAuthorId())
                    .name(b.getAuthor().getName())
                    .bio(b.getAuthor().getBio())
                    .profileUrl(b.getAuthor().getProfileUrl())
                    .build();
        }

        UserSummaryResponse user = null;
        if (b.getUploadedBy() != null) {
            user = UserSummaryResponse.builder()
                    .userId(b.getUploadedBy().getUserId())
                    .username(b.getUploadedBy().getUsername())
                    .profileUrl(b.getUploadedBy().getProfileUrl())
                    .build();
        }

        String resolvedFileUrl = b.getFileUrl();
        if (resolvedFileUrl != null && !resolvedFileUrl.startsWith("http://") && !resolvedFileUrl.startsWith("https://")) {
            try {
                resolvedFileUrl = storageService.getPresignedUrl(resolvedFileUrl);
            } catch (Exception e) {
                log.debug("Presigned URL generation deferred for {}: {}", resolvedFileUrl, e.getMessage());
            }
        }

        int percentage = (int) Math.round(Math.min(1.0, Math.max(0.0, sr.score)) * 100);

        return RecommendedResourceDto.builder()
                .bookId(b.getBookId())
                .title(b.getTitle())
                .description(b.getDescription())
                .category(b.getCategory())
                .tags(b.getTags())
                .version(b.getVersion())
                .pages(b.getPages())
                .coverUrl(b.getCoverUrl())
                .fileUrl(resolvedFileUrl)
                .fileType(b.getFileType())
                .averageRating(b.getAverageRating())
                .author(author)
                .uploadedBy(user)
                .score(Math.round(sr.score * 1000.0) / 1000.0)
                .matchPercentage(percentage)
                .recommendationReason(sr.reason)
                .signalType(sr.signalType)
                .matchedFeatures(sr.matchedTerms)
                .createdAt(b.getCreatedAt())
                .build();
    }

    private record ScoredResource(
            Book book,
            double score,
            String reason,
            String signalType,
            List<String> matchedTerms
    ) {}
}
