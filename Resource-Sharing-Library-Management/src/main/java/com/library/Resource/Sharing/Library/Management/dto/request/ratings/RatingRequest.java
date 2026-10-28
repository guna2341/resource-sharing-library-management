package com.library.Resource.Sharing.Library.Management.dto.request.ratings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;


@Data
public class RatingRequest {

    @Min(value = 1, message = "Rating must be greater than or equal to 1")
    @Max(value = 5, message = "Rating must be less than or equal to 5")
    private Long rating;

    private String review;

}
