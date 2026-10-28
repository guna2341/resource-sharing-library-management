package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.badges.BadgeRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.BadgeService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/badges")
@AllArgsConstructor
public class BadgeController {

    private BadgeService badgeService;

    @GetMapping
    public ResponseEntity<ApiResponse> getBadges() {
        ApiResponse response = badgeService.getAllBadges();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/badgetypes")
    public ResponseEntity<ApiResponse> getAllBadgeTypes() {
        ApiResponse response = badgeService.getBadgeTypes();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{badgeId}/activate")
    public ResponseEntity<ApiResponse> activateBadge(@PathVariable Long badgeId) {
        ApiResponse response = badgeService.activateBadge(badgeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{badgeId}/deactivate")
    public ResponseEntity<ApiResponse> deactivateBadge(@PathVariable Long badgeId) {
        ApiResponse response = badgeService.deactivateBadge(badgeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> postBadge(@Valid @RequestBody BadgeRequest request) {
        ApiResponse response = badgeService.postBadge(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{badgeId}")
    public ResponseEntity<ApiResponse> patchBadge(@PathVariable Long badgeId, @RequestBody BadgeRequest request) {
        ApiResponse response = badgeService.patchBadge(badgeId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{badgeId}")
    public ResponseEntity<ApiResponse> deleteBadge(@PathVariable Long badgeId) {
        ApiResponse response = badgeService.deleteBadge(badgeId);
        return ResponseEntity.ok(response);
    }

}
