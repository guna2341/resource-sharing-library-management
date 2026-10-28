package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeEarnedResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.ReadingActivity;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.readingActivity.ReadingActivityProjection;
import com.library.Resource.Sharing.Library.Management.repository.ReadingActivityRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class ReadingService {

    private UserRepository userRepository;
    private ReadingActivityRepository readingActivityRepository;
    private CheckBadgeService checkBadgeService;

    public ApiResponse getStreak(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<ReadingActivity> activities =
                readingActivityRepository
                        .findByUserOrderByReadingDateDesc(user);

        if (activities.isEmpty()) {
            return new ApiResponse(true, "Streak fetched successfully", 0);
        }

        LocalDate today = LocalDate.now();
        LocalDate latest = activities.get(0).getReadingDate();

        if (latest.isBefore(today.minusDays(1))) {
            return new ApiResponse(true, "Streak fetched successfully", 0);
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

        return new ApiResponse(true, "Streak fetched successfully", streak);
    }

    public ApiResponse recordActivity(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LocalDate date = LocalDate.now();

        if (!readingActivityRepository.existsByUserAndReadingDate(user, date)) {
            ReadingActivity readingActivity = ReadingActivity.builder()
                    .user(user)
                    .readingDate(date)
                    .build();
            readingActivityRepository.save(readingActivity);
        }
        BadgeEarnedResponse response = checkBadgeService.checkReadingBadges(user);
        if (response.getIsBadgeEarned()) {
            return new ApiResponse(true, "Reading activity added.", response);
        }
        return new ApiResponse(true, "Reading activity added.");
    }

    public ApiResponse getHistory(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<ReadingActivityProjection> activities = readingActivityRepository.findByUser_UserIdOrderByReadingDateDesc(userId);
        return new ApiResponse(true, "History fetched successfully.", activities);
    }

}
