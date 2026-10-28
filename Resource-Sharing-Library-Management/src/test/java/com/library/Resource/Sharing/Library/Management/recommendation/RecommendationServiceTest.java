package com.library.Resource.Sharing.Library.Management.recommendation;

import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.recommendation.config.RecommendationProperties;
import com.library.Resource.Sharing.Library.Management.recommendation.dto.RecommendedResourceDto;
import com.library.Resource.Sharing.Library.Management.recommendation.model.SparseVector;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.recommendation.service.NetworkRecommendationService;
import com.library.Resource.Sharing.Library.Management.recommendation.service.RecommendationService;
import com.library.Resource.Sharing.Library.Management.recommendation.service.TfIdfService;
import com.library.Resource.Sharing.Library.Management.recommendation.service.UserPreferenceService;
import com.library.Resource.Sharing.Library.Management.repository.BookRepository;
import com.library.Resource.Sharing.Library.Management.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserPreferenceService userPreferenceService;

    @Mock
    private NetworkRecommendationService networkRecommendationService;

    @Mock
    private StorageService storageService;

    private TfIdfService tfIdfService;
    private RecommendationProperties properties;
    private RecommendationService recommendationService;

    private Author author1;
    private Author author2;
    private Book book1;
    private Book book2;
    private Book book3;

    @BeforeEach
    void setUp() {
        tfIdfService = new TfIdfService();
        properties = new RecommendationProperties();

        author1 = Author.builder().authorId(1L).name("Dr. Evelyn Vasquez").build();
        author2 = Author.builder().authorId(2L).name("Prof. Marcus Chen").build();

        book1 = Book.builder()
                .bookId(101L)
                .title("Designing Resilient Distributed Systems")
                .description("Paxos and Raft consensus algorithms for cloud architectures.")
                .category("Computer Science")
                .tags("Distributed Systems, Consensus, Cloud")
                .averageRating(4.9)
                .createdAt(LocalDateTime.now().minusDays(5))
                .author(author1)
                .build();

        book2 = Book.builder()
                .bookId(102L)
                .title("Principles of Quantum Cryptography")
                .description("Lattice cryptography and post-quantum key exchange.")
                .category("Physics")
                .tags("Quantum, Cryptography, Security")
                .averageRating(4.8)
                .createdAt(LocalDateTime.now().minusDays(10))
                .author(author2)
                .build();

        book3 = Book.builder()
                .bookId(103L)
                .title("Advanced Cloud Microservices & Distributed Patterns")
                .description("Microservice resiliency patterns, consensus, and fault tolerance.")
                .category("Computer Science")
                .tags("Microservices, Cloud, Distributed Systems")
                .averageRating(4.7)
                .createdAt(LocalDateTime.now().minusDays(2))
                .author(author1)
                .build();

        tfIdfService.trainCorpus(List.of(book1, book2, book3));

        recommendationService = new RecommendationService(
                bookRepository,
                tfIdfService,
                userPreferenceService,
                networkRecommendationService,
                properties,
                storageService
        );
    }

    @Test
    @DisplayName("Personalized recommendations should exclude already interacted books and rank by hybrid score")
    void testPersonalizedRecommendations() {
        Long userId = 10L;

        // User profile: already interacted with book1 (so book1 is excluded)
        SparseVector interestVector = tfIdfService.getOrGenerateVector(book1);
        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .interestVector(interestVector)
                .excludedBookIds(Set.of(101L))
                .categoryAffinities(Map.of("Computer Science", 3.0))
                .followedAuthorIds(Set.of(1L))
                .totalInteractions(1)
                .build();

        when(bookRepository.findAllCurrentBooksWithDetails()).thenReturn(List.of(book1, book2, book3));
        when(userPreferenceService.buildUserProfile(userId)).thenReturn(profile);
        when(networkRecommendationService.computeNetworkScore(eq(book3), any())).thenReturn(1.0);
        when(networkRecommendationService.computeNetworkScore(eq(book2), any())).thenReturn(0.0);
        when(networkRecommendationService.isAuthoredByFollowedCreator(eq(book3), any())).thenReturn(true);

        List<RecommendedResourceDto> results = recommendationService.getPersonalizedRecommendations(userId, 5);

        assertNotNull(results);
        assertEquals(2, results.size());

        // Book 101 must NOT be in results (excluded because user already interacted with it)
        assertTrue(results.stream().noneMatch(r -> r.getBookId().equals(101L)));

        // Book 103 should be ranked #1 because it has high content similarity to book 101, same category, and followed author!
        assertEquals(103L, results.get(0).getBookId());
        assertNotNull(results.get(0).getRecommendationReason());
        assertTrue(results.get(0).getScore() > 0.5);
    }

    @Test
    @DisplayName("Cold-start user with no history should receive a balanced mix of popular and fresh items")
    void testColdStartRecommendations() {
        Long newUserId = 999L;
        UserProfile emptyProfile = UserProfile.builder()
                .userId(newUserId)
                .totalInteractions(0)
                .followedAuthorIds(Set.of())
                .build();

        when(bookRepository.findAllCurrentBooksWithDetails()).thenReturn(List.of(book1, book2, book3));
        when(userPreferenceService.buildUserProfile(newUserId)).thenReturn(emptyProfile);

        List<RecommendedResourceDto> results = recommendationService.getPersonalizedRecommendations(newUserId, 3);

        assertNotNull(results);
        assertEquals(3, results.size());
        assertEquals("COLD_START", results.get(0).getSignalType());
        assertNotNull(results.get(0).getRecommendationReason());
    }

    @Test
    @DisplayName("Similar resources should return high TF-IDF cosine similarity for related content")
    void testSimilarResources() {
        when(bookRepository.findById(101L)).thenReturn(Optional.of(book1));
        when(bookRepository.findAllCurrentBooksWithDetails()).thenReturn(List.of(book1, book2, book3));

        List<RecommendedResourceDto> similar = recommendationService.getSimilarResources(101L, 2);

        assertNotNull(similar);
        assertEquals(2, similar.size());

        // Target book 101 must not be in its own similar list
        assertTrue(similar.stream().noneMatch(r -> r.getBookId().equals(101L)));

        // Book 103 (Cloud Microservices & Distributed Patterns) must be ranked above Book 102 (Quantum Cryptography)
        assertEquals(103L, similar.get(0).getBookId());
        assertTrue(similar.get(0).getScore() > similar.get(1).getScore());
    }

    @Test
    @DisplayName("Empty repository should return empty list gracefully without error")
    void testEmptyRepository() {
        when(bookRepository.findAllCurrentBooksWithDetails()).thenReturn(List.of());

        List<RecommendedResourceDto> recs = recommendationService.getPersonalizedRecommendations(1L, 10);
        assertNotNull(recs);
        assertTrue(recs.isEmpty());
    }
}
