package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.ratings.RatingRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeEarnedResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.ratings.RatingResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.RatingMapper;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.Ratings;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.ratings.RatingProjection;
import com.library.Resource.Sharing.Library.Management.repository.BookRepository;
import com.library.Resource.Sharing.Library.Management.repository.RatingRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RatingService {

    private RatingRepository ratingRepository;
    private UserRepository userRepository;
    private BookRepository bookRepository;
    private RatingMapper ratingMapper;
    private CheckBadgeService checkBadgeService;

    private RatingResponse getRatingResponse(Ratings ratings) {
        return RatingResponse.builder()
                .userId(UserResponse.builder()
                        .userId(ratings.getUser().getUserId())
                        .username(ratings.getUser().getUsername())
                        .profileUrl(ratings.getUser().getProfileUrl())
                        .build())
                .ratingId(ratings.getRatingId())
                .bookId(ratings.getBook().getBookId())
                .rating(ratings.getRating())
                .review(ratings.getReview())
                .createdAt(ratings.getCreatedAt())
                .updatedAt(ratings.getUpdatedAt())
                .build();
    }

    public ApiResponse getRatings(Long bookId) {
        List<RatingProjection> ratings = ratingRepository.findAllRatings(bookId);
        return new ApiResponse(true, "Ratings fetched successfully.", ratings);
    }

    public ApiResponse getUserRatings(Long bookId, Long userId) {
        RatingProjection rating = ratingRepository.findUserRating(bookId, userId);
        return new ApiResponse(true, "Rating fetched successfully.", rating);
    }

    @Transactional
    public ApiResponse postRating(Long bookId, Long userId, RatingRequest request) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found."));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Ratings ratings = ratingRepository.findByUser_UserIdAndBook_BookId(userId, bookId)
                .orElse(null);

        if (ratings != null) {
            ratings.setRating(request.getRating());
            ratings.setReview(request.getReview());
        } else {
            ratings = Ratings.builder()
                    .user(user)
                    .book(book)
                    .rating(request.getRating())
                    .review(request.getReview())
                    .build();
        }

        Ratings savedRating = ratingRepository.save(ratings);
        RatingResponse response = getRatingResponse(savedRating);
        BadgeEarnedResponse badgeEarnedResponse = checkBadgeService.checkRatingBadges(user);
        if (badgeEarnedResponse.getIsBadgeEarned()) {
            return new ApiResponse(true, "Rating submitted successfully.", response, badgeEarnedResponse);
        }
        return new ApiResponse(true, "Rating submitted successfully.", response);
    }

    public ApiResponse patchRating(Long ratingId, RatingRequest request) {
        Ratings ratings = ratingRepository.findById(ratingId).orElseThrow(() -> new ResourceNotFoundException("Rating not found."));
        ratingMapper.updateRating(request, ratings);
        Ratings savedRating = ratingRepository.save(ratings);
        RatingResponse ratingResponse = getRatingResponse(savedRating);
        return new ApiResponse(true, "Rating patched successfully.", ratingResponse);
    }

    @Transactional
    public ApiResponse deleteRating(Long ratingOrBookId) {
        Ratings ratings = ratingRepository.findById(ratingOrBookId).orElse(null);
        if (ratings == null) {
            List<Ratings> list = ratingRepository.findByBook_BookId(ratingOrBookId);
            if (!list.isEmpty()) {
                ratingRepository.deleteAll(list);
                return new ApiResponse(true, "Rating deleted successfully.");
            }
            return new ApiResponse(true, "Rating already deleted or not found.");
        }
        ratingRepository.delete(ratings);
        return new ApiResponse(true, "Rating deleted successfully.");
    }

    @Transactional
    public ApiResponse deleteUserRating(Long bookId, Long userId) {
        ratingRepository.deleteByUser_UserIdAndBook_BookId(userId, bookId);
        return new ApiResponse(true, "Rating deleted successfully.");
    }
}
