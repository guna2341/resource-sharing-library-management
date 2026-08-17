package com.library.Resource.Sharing.Library.Management.dto.request.comments;

import com.library.Resource.Sharing.Library.Management.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentsRequest {

    @NotNull(message = "Comment is required")
    private String content;

}
