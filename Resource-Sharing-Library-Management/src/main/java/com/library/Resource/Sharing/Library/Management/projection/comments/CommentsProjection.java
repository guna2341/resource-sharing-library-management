package com.library.Resource.Sharing.Library.Management.projection.comments;

import com.library.Resource.Sharing.Library.Management.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentsProjection {

    private String commentId;

    private String content;

    private Long likes;

    private User user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
