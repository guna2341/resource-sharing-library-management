package com.library.Resource.Sharing.Library.Management.recommendation.service;

import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.recommendation.model.UserProfile;
import com.library.Resource.Sharing.Library.Management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NetworkRecommendationService {

    private final CommunityMembersRepository communityMembersRepository;
    private final RatingRepository ratingRepository;
    private final BookMarkRepository bookMarkRepository;

    /**
     * Computes the network relevance score for a book relative to a user and their network.
     * Normalized between 0.0 and 1.0.
     */
    public double computeNetworkScore(Book book, UserProfile profile) {
        if (book == null || profile == null) {
            return 0.0;
        }

        double authorScore = 0.0;
        double communityPeerScore = 0.0;

        // 1. Direct connection: Followed author signal (highest weight in network)
        if (book.getAuthor() != null && profile.getFollowedAuthorIds().contains(book.getAuthor().getAuthorId())) {
            authorScore = 1.0;
        }

        // 2. Community peer interactions
        if (profile.getUserId() != null) {
            List<CommunityMembers> userMemberships = communityMembersRepository.findByUser_UserId(profile.getUserId());
            if (userMemberships != null && !userMemberships.isEmpty()) {
                List<Long> communityIds = userMemberships.stream()
                        .map(cm -> cm.getCommunities().getCommunityId())
                        .distinct()
                        .toList();

                List<Long> peerUserIds = communityMembersRepository.findPeerUserIdsInCommunities(communityIds, profile.getUserId());
                if (peerUserIds != null && !peerUserIds.isEmpty()) {
                    // Count how many peers in user's communities rated or saved this book
                    int peerInteractions = 0;
                    for (Long peerId : peerUserIds) {
                        if (ratingRepository.findByUser_UserIdAndBook_BookId(peerId, book.getBookId()).isPresent()) {
                            peerInteractions++;
                        }
                    }
                    communityPeerScore = Math.min(1.0, peerInteractions / 3.0);
                }
            }
        }

        // Weight direct followed connections more heavily than broader community activity
        if (authorScore > 0.0 && communityPeerScore > 0.0) {
            return 0.75 * authorScore + 0.25 * communityPeerScore;
        } else if (authorScore > 0.0) {
            return authorScore;
        } else {
            return communityPeerScore;
        }
    }

    /**
     * Returns true if the resource is directly authored by someone the user follows.
     */
    public boolean isAuthoredByFollowedCreator(Book book, UserProfile profile) {
        if (book == null || book.getAuthor() == null || profile == null) {
            return false;
        }
        return profile.getFollowedAuthorIds().contains(book.getAuthor().getAuthorId());
    }
}
