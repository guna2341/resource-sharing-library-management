package com.library.Resource.Sharing.Library.Management.projection.ratings;


import java.time.LocalDateTime;

public interface RatingProjection {

     Long getRatingId();

     BookProjection getBook();

     interface BookProjection {
          Long getBookId();
     }

     UserProjection getUser();

     interface UserProjection {
          Long getUserId();
          String getUsername();
          String getProfileUrl();
     }

     Long getRating();

     String getReview();

     LocalDateTime getCreatedAt();

     LocalDateTime getUpdatedAt();
    
}
