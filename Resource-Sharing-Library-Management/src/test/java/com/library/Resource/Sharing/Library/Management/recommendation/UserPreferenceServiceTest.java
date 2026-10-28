package com.library.Resource.Sharing.Library.Management.recommendation;

import com.library.Resource.Sharing.Library.Management.model.*;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.recommendation.service.TfIdfService;
import com.library.Resource.Sharing.Library.Management.recommendation.service.UserPreferenceService;
import com.library.Resource.Sharing.Library.Management.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPreferenceServiceTest {

    @Mock
    private BookMarkRepository bookMarkRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private AuthorFollowRepository authorFollowRepository;

    private TfIdfService tfIdfService;
    private UserPreferenceService userPreferenceService;

    @BeforeEach
    void setUp() {
        tfIdfService = new TfIdfService();
        userPreferenceService = new UserPreferenceService(
                bookMarkRepository,
                wishlistRepository,
                ratingRepository,
                authorFollowRepository,
                tfIdfService
        );
    }

    @Test
    @DisplayName("User profile should aggregate bookmarks, wishlist, ratings, and track excluded IDs")
    void testBuildUserProfileFullInteractions() {
        Long userId = 100L;
        Author author = Author.builder().authorId(10L).name("Dr. Evelyn Vasquez").build();

        Book book1 = Book.builder()
                .bookId(101L)
                .title("Distributed Systems")
                .category("Computer Science")
                .author(author)
                .build();

        Book book2 = Book.builder()
                .bookId(102L)
                .title("Cloud Infrastructure")
                .category("Computer Science")
                .author(author)
                .build();

        Book book3 = Book.builder()
                .bookId(103L)
                .title("Quantum Computing")
                .category("Physics")
                .author(Author.builder().authorId(11L).name("Marcus Chen").build())
                .build();

        // 1 Bookmark
        BookMark bm = BookMark.builder().book(book1).build();
        when(bookMarkRepository.findByUser_UserId(userId)).thenReturn(List.of(bm));

        // 1 Wishlist item
        Wishlist wl = Wishlist.builder().book(book2).build();
        when(wishlistRepository.findByUser_UserId(userId)).thenReturn(List.of(wl));

        // 1 High rating (5 stars)
        Ratings rating = Ratings.builder().book(book3).rating(5L).build();
        when(ratingRepository.findByUser_UserId(userId)).thenReturn(List.of(rating));

        // Followed author
        when(authorFollowRepository.findFollowedAuthorIds(userId)).thenReturn(List.of(10L));

        UserProfile profile = userPreferenceService.buildUserProfile(userId);

        assertNotNull(profile);
        assertTrue(profile.hasActivity());
        assertEquals(3, profile.getTotalInteractions());

        // Check exclusions: books 101, 102, 103 should be excluded from future recommendations
        assertTrue(profile.getExcludedBookIds().contains(101L));
        assertTrue(profile.getExcludedBookIds().contains(102L));
        assertTrue(profile.getExcludedBookIds().contains(103L));

        // Top category should be Computer Science (had 2 interactions: 3.0 + 3.0 = 6.0 affinity vs Physics 3.5)
        assertEquals("Computer Science", profile.getTopCategory());

        // Followed authors
        assertTrue(profile.getFollowedAuthorIds().contains(10L));

        // Composite vector should be normalized
        assertEquals(1.0, profile.getInterestVector().norm(), 0.001);
    }

    @Test
    @DisplayName("Cold-start user with no interactions should return empty profile safely")
    void testColdStartUserProfile() {
        Long userId = 200L;
        when(bookMarkRepository.findByUser_UserId(userId)).thenReturn(List.of());
        when(wishlistRepository.findByUser_UserId(userId)).thenReturn(List.of());
        when(ratingRepository.findByUser_UserId(userId)).thenReturn(List.of());
        when(authorFollowRepository.findFollowedAuthorIds(userId)).thenReturn(List.of());

        UserProfile profile = userPreferenceService.buildUserProfile(userId);

        assertNotNull(profile);
        assertFalse(profile.hasActivity());
        assertEquals(0, profile.getTotalInteractions());
        assertTrue(profile.getExcludedBookIds().isEmpty());
        assertNull(profile.getTopCategory());
    }
}
