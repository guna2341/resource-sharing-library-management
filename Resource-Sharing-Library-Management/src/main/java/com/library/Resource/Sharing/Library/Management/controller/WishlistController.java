package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.WishlistService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@AllArgsConstructor
public class WishlistController {

    private WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getWishlists(@PathVariable Long userId) {
        ApiResponse response = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/{bookId}")
    public ResponseEntity<ApiResponse> addWishlist(@PathVariable Long userId, @PathVariable Long bookId) {
        ApiResponse response = wishlistService.addWishlist(bookId, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse> deleteWishlist(@PathVariable Long wishlistId) {
        ApiResponse response = wishlistService.removeWishlist(wishlistId);
        return ResponseEntity.ok(response);
    }

}
