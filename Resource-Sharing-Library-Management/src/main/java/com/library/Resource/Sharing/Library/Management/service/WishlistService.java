package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.exception.DuplicateResourceException;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.model.Wishlist;
import com.library.Resource.Sharing.Library.Management.projection.wishlist.WishlistProjection;
import com.library.Resource.Sharing.Library.Management.repository.BookRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import com.library.Resource.Sharing.Library.Management.repository.WishlistRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class WishlistService {

    private WishlistRepository wishlistRepository;
    private UserRepository userRepository;
    private BookRepository bookRepository;

    public ApiResponse getWishlist(Long userId) {
        List<WishlistProjection> wishlists = wishlistRepository.getWishlist(userId);
        return new ApiResponse(true, "Wishlist fetched successfully.", wishlists);
    }

    public ApiResponse addWishlist(Long bookId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with id: " + userId + " not found."));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book with id: " + bookId + " not found."));
        if (wishlistRepository.existsByUser_UserId(userId)) {
            throw new DuplicateResourceException("Product is already in wishlist.");
        }
        Wishlist wishlist = Wishlist.builder()
                .book(book)
                .user(user)
                .build();
        wishlistRepository.save(wishlist);
        return new ApiResponse(true, "Product added to wishlist.");
    }

    public ApiResponse removeWishlist(Long wishlistId) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId).orElseThrow(() -> new ResourceNotFoundException("Wishlist with id: " + wishlistId + " not found."));
        wishlistRepository.save(wishlist);
        return new ApiResponse(true, "Product removed from wishlist.");
    }

}
