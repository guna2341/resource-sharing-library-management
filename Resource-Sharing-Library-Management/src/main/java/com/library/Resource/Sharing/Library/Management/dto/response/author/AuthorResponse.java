package com.library.Resource.Sharing.Library.Management.dto.response.author;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuthorResponse {

    private Long authorId;

    private String name;

    private String bio;

    private String profileUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
