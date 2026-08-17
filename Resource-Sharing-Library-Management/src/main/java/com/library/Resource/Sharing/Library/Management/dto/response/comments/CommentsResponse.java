package com.library.Resource.Sharing.Library.Management.dto.response.comments;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentsResponse {

    private Long commentId;

    private String content;

    private Long likes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
