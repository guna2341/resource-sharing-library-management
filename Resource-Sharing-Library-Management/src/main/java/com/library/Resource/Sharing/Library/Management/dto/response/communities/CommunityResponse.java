package com.library.Resource.Sharing.Library.Management.dto.response.communities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommunityResponse {

    private Long communityId;

    private String name;

    private String description;

    private String profileUrl;

    private UserSummaryResponse user;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
