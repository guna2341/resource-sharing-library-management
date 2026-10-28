package com.library.Resource.Sharing.Library.Management.recommendation;

import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.Communities;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.model.Ratings;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.recommendation.service.NetworkRecommendationService;
import com.library.Resource.Sharing.Library.Management.repository.BookMarkRepository;
import com.library.Resource.Sharing.Library.Management.repository.CommunityMembersRepository;
import com.library.Resource.Sharing.Library.Management.repository.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NetworkRecommendationServiceTest {

    @Mock
    private CommunityMembersRepository communityMembersRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private BookMarkRepository bookMarkRepository;

    private NetworkRecommendationService networkService;

    @BeforeEach
    void setUp() {
        networkService = new NetworkRecommendationService(
                communityMembersRepository,
                ratingRepository,
                bookMarkRepository
        );
    }

    @Test
    @DisplayName("Direct followed author should receive full 1.0 network score")
    void testFollowedAuthorScore() {
        Author followedAuthor = Author.builder().authorId(10L).name("Dr. Evelyn").build();
        Book book = Book.builder().bookId(101L).author(followedAuthor).build();

        UserProfile profile = UserProfile.builder()
                .userId(1L)
                .followedAuthorIds(Set.of(10L))
                .build();

        when(communityMembersRepository.findByUser_UserId(1L)).thenReturn(List.of());

        double score = networkService.computeNetworkScore(book, profile);
        assertEquals(1.0, score, 0.001);
        assertTrue(networkService.isAuthoredByFollowedCreator(book, profile));
    }

    @Test
    @DisplayName("Community peer activity should contribute to network score for non-followed author")
    void testCommunityPeerScore() {
        Author unfollowedAuthor = Author.builder().authorId(20L).name("Prof. Chen").build();
        Book book = Book.builder().bookId(202L).author(unfollowedAuthor).build();

        UserProfile profile = UserProfile.builder()
                .userId(1L)
                .followedAuthorIds(Set.of())
                .build();

        Communities community = Communities.builder().communityId(50L).name("Cloud Systems").build();
        CommunityMembers membership = CommunityMembers.builder().communities(community).build();

        when(communityMembersRepository.findByUser_UserId(1L)).thenReturn(List.of(membership));
        when(communityMembersRepository.findPeerUserIdsInCommunities(List.of(50L), 1L)).thenReturn(List.of(2L, 3L));

        when(ratingRepository.findByUser_UserIdAndBook_BookId(2L, 202L)).thenReturn(Optional.of(Ratings.builder().build()));
        when(ratingRepository.findByUser_UserIdAndBook_BookId(3L, 202L)).thenReturn(Optional.empty());

        double score = networkService.computeNetworkScore(book, profile);
        assertTrue(score > 0.0);
        assertFalse(networkService.isAuthoredByFollowedCreator(book, profile));
    }
}
