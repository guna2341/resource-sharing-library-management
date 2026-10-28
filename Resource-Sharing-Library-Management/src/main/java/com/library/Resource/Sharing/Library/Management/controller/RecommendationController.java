package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.recommendation.dto.RecommendedResourceDto;
import com.library.Resource.Sharing.Library.Management.recommendation.service.RecommendationService;
import com.library.Resource.Sharing.Library.Management.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/v1/recommendations", "/api/recommendations"})
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * GET /api/v1/recommendations/for-me
     * Returns personalized hybrid recommendations for the authenticated user.
     */
    @GetMapping("/for-me")
    public ResponseEntity<ApiResponse> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long userId
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(userId);
        log.debug("Fetching personalized recommendations for userId={}", currentUserId);

        List<RecommendedResourceDto> recommendations = recommendationService.getPersonalizedRecommendations(currentUserId, limit);

        return ResponseEntity.ok(new ApiResponse(
                true,
                "Personalized recommendations retrieved successfully.",
                recommendations
        ));
    }

    /**
     * GET /api/v1/recommendations/similar/{bookId}
     * Returns resources with highest content-based TF-IDF cosine similarity.
     */
    @GetMapping("/similar/{bookId}")
    public ResponseEntity<ApiResponse> getSimilarResources(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "6") int limit
    ) {
        log.debug("Fetching similar resources for bookId={}", bookId);
        List<RecommendedResourceDto> similar = recommendationService.getSimilarResources(bookId, limit);

        return ResponseEntity.ok(new ApiResponse(
                true,
                "Similar resources retrieved successfully.",
                similar
        ));
    }

    /**
     * GET /api/v1/recommendations/trending
     * Returns top trending resources across the academic catalog.
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse> getTrendingResources(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<RecommendedResourceDto> trending = recommendationService.getTrendingResources(limit);

        return ResponseEntity.ok(new ApiResponse(
                true,
                "Trending resources retrieved successfully.",
                trending
        ));
    }

    /**
     * GET /api/v1/recommendations/network
     * Returns recommendations derived from followed authors and community peers.
     */
    @GetMapping("/network")
    public ResponseEntity<ApiResponse> getNetworkRecommendations(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long userId
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(userId);
        List<RecommendedResourceDto> network = recommendationService.getNetworkRecommendations(currentUserId, limit);

        return ResponseEntity.ok(new ApiResponse(
                true,
                "Network recommendations retrieved successfully.",
                network
        ));
    }

    /**
     * GET /api/v1/recommendations/category
     * Returns recommendations for a specific category.
     */
    @GetMapping("/category")
    public ResponseEntity<ApiResponse> getRecommendationsByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<RecommendedResourceDto> categoryRecs = recommendationService.getRecommendationsByCategory(category, limit);

        return ResponseEntity.ok(new ApiResponse(
                true,
                "Category recommendations retrieved successfully.",
                categoryRecs
        ));
    }

    /**
     * POST /api/v1/recommendations/refresh
     * Triggers retraining of the TF-IDF feature space and cache invalidation.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshCache() {
        recommendationService.refreshCache();
        return ResponseEntity.ok(new ApiResponse(
                true,
                "Recommendation cache and TF-IDF corpus retrained successfully."
        ));
    }
}
