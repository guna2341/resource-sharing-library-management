package com.library.Resource.Sharing.Library.Management.dto.response.comments;

import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.projection.comments.CommentsProjection;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentsResponse {

    private Long commentId;

    private String content;

    UserSummaryResponse user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
