package com.library.Resource.Sharing.Library.Management.dto.request.messages;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageRequest {

    @NotBlank(message = "Content is required")
    String content;

}
