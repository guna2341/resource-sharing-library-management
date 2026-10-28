package com.library.Resource.Sharing.Library.Management.dto.response.communities;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunitySummaryResponse {

    private Long communityId;
    private String name;
    private String description;
    private String profileUrl;
    
}
