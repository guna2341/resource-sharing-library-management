package com.library.Resource.Sharing.Library.Management.dto.response.author;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthorSummaryResponse {

    private Long authorId;

    private String name;

    private String bio;

    private String profileUrl;

}
