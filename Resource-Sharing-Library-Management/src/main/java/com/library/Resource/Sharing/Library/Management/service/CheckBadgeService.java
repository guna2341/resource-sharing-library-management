package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeEarnedResponse;
import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.*;
import com.library.Resource.Sharing.Library.Management.repository.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class CheckBadgeService {

    private BadgeRepository badgeRepository;
    private UserBadgeRepository userBadgeRepository;
    private RatingRepository ratingRepository;
    private ReadingActivityRepository readingActivityRepository;
    private UserPointsRepository userPointsRepository;
    private LeaderboardService leaderboardService;

    @Transactional
    private void awardBadge(User user, Badges badge) {
        UserBadges userBadges = UserBadges.builder()
                .user(user)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadges);
        UserPoints userPoints = UserPoints.builder()
                .badge(badge)
                .points(badge.getPoints())
                .user(user)
                .build();
        userPointsRepository.save(userPoints);
        leaderboardService.addPoints(user.getUserId(), badge.getPoints());
    }

    public BadgeEarnedResponse checkBookBadges(User user) {

        List<Badges> badges = badgeRepository.findByRequirementTypeAndActiveTrue(BadgeRequirementType.BOOK_UPLOAD);

        List<Badges> awardedBadges = new ArrayList<Badges>();

        boolean isBadgeEarned = false;
        for(Badges badge: badges) {
            if (user.getTotalBooksUploaded() >= badge.getRequirementValue()) {
                if (userBadgeRepository.existsByUserAndBadge(user, badge)) {
                    continue;
                }
                isBadgeEarned = true;
                awardBadge(user, badge);
                awardedBadges.add(badge);
            }
        }
        return BadgeEarnedResponse.builder()
                .isBadgeEarned(isBadgeEarned)
                .badges(awardedBadges)
                .build();
    }

    public BadgeEarnedResponse checkRatingBadges(User user) {
        long ratingCount = ratingRepository.countByUser_UserId(user.getUserId());

        List<Badges> badges = badgeRepository.findByRequirementTypeAndActiveTrue(BadgeRequirementType.RATING);

        List<Badges> awardedBadges = new ArrayList<Badges>();
        boolean isBadgeEarned = false;

        for(Badges badge: badges) {
            if (ratingCount >= badge.getRequirementValue()) {
                if (userBadgeRepository.existsByUserAndBadge(user, badge)) {
                    continue;
                }
                isBadgeEarned = true;
                awardBadge(user, badge);
                awardedBadges.add(badge);
            }
        }
        return BadgeEarnedResponse.builder()
                .isBadgeEarned(isBadgeEarned)
                .badges(awardedBadges)
                .build();
    }

    public BadgeEarnedResponse checkDownloadBadges(User user) {
        Long downloads = user.getTotalBooksDownloaded() != null ? user.getTotalBooksDownloaded() : 0L;

        List<Badges> badges = badgeRepository.findByRequirementTypeAndActiveTrue(BadgeRequirementType.DOWNLOAD);

        List<Badges> awardedBadges = new ArrayList<Badges>();

        boolean isBadgeEarned = false;

        for(Badges badge: badges) {
            if (downloads >= badge.getRequirementValue()) {
                if (userBadgeRepository.existsByUserAndBadge(user, badge)) {
                    continue;
                }
                isBadgeEarned = true;
                awardBadge(user, badge);
                awardedBadges.add(badge);
            }
        }
        return BadgeEarnedResponse.builder()
                .isBadgeEarned(isBadgeEarned)
                .badges(awardedBadges)
                .build();
    }

    private int getStreak(User user) {
        List<ReadingActivity> activities =
                readingActivityRepository
                        .findByUserOrderByReadingDateDesc(user);

        if (activities.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate latest = activities.getFirst().getReadingDate();

        if (latest.isBefore(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        LocalDate expectedDate = latest;

        for (ReadingActivity activity : activities) {

            if (activity.getReadingDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }


    public BadgeEarnedResponse checkReadingBadges(User user) {
        int streak = getStreak(user);

        List<Badges> badges = badgeRepository.findByRequirementTypeAndActiveTrue(BadgeRequirementType.READING_STREAK);

        List<Badges> awardedBadges = new ArrayList<Badges>();

        boolean isBadgeEarned = false;

        for(Badges badge: badges) {
            if (streak >= badge.getRequirementValue()) {
                if (userBadgeRepository.existsByUserAndBadge(user, badge)) {
                    continue;
                }
                isBadgeEarned = true;
                awardBadge(user, badge);
                awardedBadges.add(badge);
            }
        }

        return BadgeEarnedResponse.builder()
                .isBadgeEarned(isBadgeEarned)
                .badges(awardedBadges)
                .build();
    }

}
