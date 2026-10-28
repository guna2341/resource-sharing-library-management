package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.ratings.RatingRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.exception.BadRequest;
import com.library.Resource.Sharing.Library.Management.service.RatingService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rating")
@AllArgsConstructor
public class RatingController {

    private RatingService ratingService;

    @GetMapping("/{bookId}")
    public ResponseEntity<ApiResponse> getRatings(@PathVariable Long bookId) {
        ApiResponse response = ratingService.getRatings(bookId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/{bookId}")
    public ResponseEntity<ApiResponse> getRatingByUserId(@PathVariable Long bookId, @PathVariable Long userId) {
        ApiResponse response = ratingService.getUserRatings(bookId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookId}/{userId}")
    public ResponseEntity<ApiResponse> postRating(@PathVariable Long bookId, @PathVariable Long userId, @Valid @RequestBody  RatingRequest request) {
        if (request.getRating() <= 0 || request.getRating() > 5) {
             throw new BadRequest("Rating must be greater than 0 and less than 5");
        }
        ApiResponse response = ratingService.postRating(bookId, userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("{ratingId}")
    public ResponseEntity<ApiResponse> patchRating(@PathVariable Long ratingId, @RequestBody RatingRequest request) {
        ApiResponse response = ratingService.patchRating(ratingId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<ApiResponse> deleteRating(@PathVariable Long bookId) {
        ApiResponse response = ratingService.deleteRating(bookId);
        return ResponseEntity.ok(response);
    }

}
