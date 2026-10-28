package com.library.Resource.Sharing.Library.Management.recommendation.service;

import com.library.Resource.Sharing.Library.Management.model.*;
import com.library.Resource.Sharing.Library.Management.recommendation.model.SparseVector;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final BookMarkRepository bookMarkRepository;
    private final WishlistRepository wishlistRepository;
    private final RatingRepository ratingRepository;
    private final AuthorFollowRepository authorFollowRepository;
    private final TfIdfService tfIdfService;

    // Interaction signal weights
    private static final double WEIGHT_BOOKMARK = 3.0;
    private static final double WEIGHT_WISHLIST = 3.0;
    private static final double WEIGHT_HIGH_RATING = 3.5;
    private static final double WEIGHT_MODERATE_RATING = 1.5;
    private static final double WEIGHT_FOLLOWED_AUTHOR_BONUS = 2.0;

    /**
     * Builds a comprehensive preference profile for a user based on interactions.
     */
    public UserProfile buildUserProfile(Long userId) {
        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .interestVector(new SparseVector())
                .excludedBookIds(new HashSet<>())
                .categoryAffinities(new HashMap<>())
                .followedAuthorIds(new HashSet<>())
                .totalInteractions(0)
                .build();

        if (userId == null) {
            return profile;
        }

        SparseVector compositeVector = new SparseVector();
        Map<String, Double> categoryWeights = new HashMap<>();
        Map<Long, Double> authorWeights = new HashMap<>();
        Map<Long, String> authorNames = new HashMap<>();
        int interactions = 0;

        // 1. Bookmarks (Explicit high-intent save)
        List<BookMark> bookmarks = bookMarkRepository.findByUser_UserId(userId);
        for (BookMark bm : bookmarks) {
            Book book = bm.getBook();
            if (book != null && book.getBookId() != null) {
                profile.getExcludedBookIds().add(book.getBookId());
                SparseVector vector = tfIdfService.getOrGenerateVector(book);
                compositeVector.addScaled(vector, WEIGHT_BOOKMARK);
                recordCategoryAffinity(categoryWeights, book.getCategory(), WEIGHT_BOOKMARK);
                recordAuthorAffinity(authorWeights, authorNames, book.getAuthor(), WEIGHT_BOOKMARK);
                interactions++;
            }
        }

        // 2. Wishlist items (Explicit high-intent queue)
        List<Wishlist> wishlists = wishlistRepository.findByUser_UserId(userId);
        for (Wishlist wl : wishlists) {
            Book book = wl.getBook();
            if (book != null && book.getBookId() != null) {
                profile.getExcludedBookIds().add(book.getBookId());
                SparseVector vector = tfIdfService.getOrGenerateVector(book);
                compositeVector.addScaled(vector, WEIGHT_WISHLIST);
                recordCategoryAffinity(categoryWeights, book.getCategory(), WEIGHT_WISHLIST);
                recordAuthorAffinity(authorWeights, authorNames, book.getAuthor(), WEIGHT_WISHLIST);
                interactions++;
            }
        }

        // 3. Ratings (Explicit user feedback)
        List<Ratings> ratings = ratingRepository.findByUser_UserId(userId);
        for (Ratings r : ratings) {
            Book book = r.getBook();
            if (book != null && book.getBookId() != null) {
                profile.getExcludedBookIds().add(book.getBookId());
                long score = r.getRating() != null ? r.getRating() : 3L;
                if (score >= 4) {
                    double weight = WEIGHT_HIGH_RATING * (score / 5.0);
                    SparseVector vector = tfIdfService.getOrGenerateVector(book);
                    compositeVector.addScaled(vector, weight);
                    recordCategoryAffinity(categoryWeights, book.getCategory(), weight);
                    recordAuthorAffinity(authorWeights, authorNames, book.getAuthor(), weight);
                    interactions++;
                } else if (score == 3) {
                    SparseVector vector = tfIdfService.getOrGenerateVector(book);
                    compositeVector.addScaled(vector, WEIGHT_MODERATE_RATING);
                    recordCategoryAffinity(categoryWeights, book.getCategory(), WEIGHT_MODERATE_RATING);
                    interactions++;
                }
            }
        }

        // 4. Followed Authors
        List<Long> followedAuthors = authorFollowRepository.findFollowedAuthorIds(userId);
        if (followedAuthors != null && !followedAuthors.isEmpty()) {
            profile.getFollowedAuthorIds().addAll(followedAuthors);
            for (Long authorId : followedAuthors) {
                authorWeights.merge(authorId, WEIGHT_FOLLOWED_AUTHOR_BONUS, Double::sum);
            }
        }

        // 5. Finalize profile vector and top category
        compositeVector.normalize();
        profile.setInterestVector(compositeVector);
        profile.setCategoryAffinities(categoryWeights);
        profile.setTotalInteractions(interactions);

        // Find top category
        categoryWeights.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(entry -> profile.setTopCategory(entry.getKey()));

        // Find top author name
        authorWeights.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(entry -> profile.setTopAuthorName(authorNames.get(entry.getKey())));

        log.debug("Built user profile for userId={}: {} interactions, topCategory={}, followedAuthors={}",
                userId, interactions, profile.getTopCategory(), profile.getFollowedAuthorIds().size());

        return profile;
    }

    private void recordCategoryAffinity(Map<String, Double> map, String category, double weight) {
        if (category != null && !category.isBlank()) {
            map.merge(category.trim(), weight, Double::sum);
        }
    }

    private void recordAuthorAffinity(Map<Long, Double> weights, Map<Long, String> names, Author author, double weight) {
        if (author != null && author.getAuthorId() != null) {
            weights.merge(author.getAuthorId(), weight, Double::sum);
            if (author.getName() != null) {
                names.put(author.getAuthorId(), author.getName());
            }
        }
    }
}
