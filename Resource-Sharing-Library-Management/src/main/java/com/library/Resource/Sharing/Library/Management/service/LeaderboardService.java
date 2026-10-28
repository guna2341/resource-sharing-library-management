package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.leaderboard.LeaderboardResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.projection.book.UserSummaryProjection;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class LeaderboardService {

    private final RedisTemplate<String, String> redisTemplate;
    private UserRepository userRepository;

    private static final String LEADERBOARD = "leaderboard:global";

    public void addPoints(Long userId, Long points) {
        redisTemplate.opsForZSet()
                .incrementScore(
                        LEADERBOARD,
                        userId.toString(),
                        points
                );
    }

    public ApiResponse getTopUsers(int limit) {

        Set<ZSetOperations.TypedTuple<String>> entries =
                redisTemplate.opsForZSet()
                        .reverseRangeWithScores(
                                LEADERBOARD,
                                0,
                                limit - 1
                        );

        if (entries == null || entries.isEmpty()) {
            return new ApiResponse(
                    true,
                    "Leaderboard fetched successfully.",
                    Collections.emptyList()
            );
        }

        List<Long> userIds = entries.stream()
                .map(tuple -> Long.valueOf(tuple.getValue()))
                .toList();

        List<UserSummaryProjection> users =
                userRepository.findAllByUserIdIn(userIds);

        Map<Long, UserSummaryProjection> userMap =
                users.stream()
                        .collect(Collectors.toMap(
                                UserSummaryProjection::getUserId,
                                user -> user
                        ));

        List<LeaderboardResponse> leaderboard = new ArrayList<>();

        long rank = 1L;

        for (ZSetOperations.TypedTuple<String> entry : entries) {

            Long userId = Long.valueOf(entry.getValue());

            UserSummaryProjection user = userMap.get(userId);

            if (user == null) {
                continue;
            }

            leaderboard.add(
                    new LeaderboardResponse(
                            user.getUserId(),
                            user.getUsername(),
                            user.getProfileUrl(),
                            entry.getScore(),
                            rank++
                    )
            );
        }

        return new ApiResponse(
                true,
                "Leaderboard fetched successfully.",
                leaderboard
        );
    }

    public ApiResponse getUserDetails(Long userId) {

        UserSummaryProjection user =
                userRepository.findByUserId(userId);

        if (user == null) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        Double points = null;
        Long rank = null;

        try {
            points = redisTemplate.opsForZSet().score(LEADERBOARD, userId.toString());
            rank = redisTemplate.opsForZSet().reverseRank(LEADERBOARD, userId.toString());
        } catch (Exception e) {
            // Log and fallback
        }

        LeaderboardResponse response = LeaderboardResponse.builder()
                .userId(userId)
                .username(user.getUsername())
                .profileUrl(user.getProfileUrl())
                .points(points != null ? points : 0.0)
                .rank(rank == null ? null : rank + 1)
                .build();

        return new ApiResponse(
                true,
                "Points fetched successfully.",
                response
        );
    }

}
