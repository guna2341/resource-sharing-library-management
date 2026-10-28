package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.UserBadgeService;
import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/userbadge")
@AllArgsConstructor
public class UserBadgeController {

    private UserBadgeService userBadgeService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUserBadges(@PathVariable Long userId) {
        ApiResponse response = userBadgeService.getUserBadges(userId);
        return ResponseEntity.ok(response);
    }
}
