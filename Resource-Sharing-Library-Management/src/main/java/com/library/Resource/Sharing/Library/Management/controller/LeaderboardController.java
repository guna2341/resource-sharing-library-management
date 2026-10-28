package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.LeaderboardService;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/leaderboard")
@AllArgsConstructor
public class LeaderboardController {

    private LeaderboardService leaderboardService;

    @GetMapping("/{limit}")
    public ResponseEntity<ApiResponse> getTopUsers(@PathVariable int limit) {
        ApiResponse response = leaderboardService.getTopUsers(limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/details/{userId}")
    public ResponseEntity<ApiResponse> getRank(@PathVariable Long userId) {
        ApiResponse response = leaderboardService.getUserDetails(userId);
        return ResponseEntity.ok(response);
    }

}
