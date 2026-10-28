package com.library.Resource.Sharing.Library.Management.projection.comments;


import java.time.LocalDateTime;

public interface CommentsProjection {

     String getCommentId();

     String getContent();

    UserProjection getUser();

    interface UserProjection {
        Long getUserId();
        String getUsername();
        String getProfileUrl();
    }
     LocalDateTime getCreatedAt();

     LocalDateTime getUpdatedAt();

}
