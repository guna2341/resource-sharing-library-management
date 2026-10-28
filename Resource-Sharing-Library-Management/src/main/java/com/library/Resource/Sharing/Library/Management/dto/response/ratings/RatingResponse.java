package com.library.Resource.Sharing.Library.Management.dto.response.ratings;

import com.library.Resource.Sharing.Library.Management.dto.response.users.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RatingResponse {

    private Long ratingId;

    private Long bookId;

    private UserResponse userId;

    private Long rating;

    private String review;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
