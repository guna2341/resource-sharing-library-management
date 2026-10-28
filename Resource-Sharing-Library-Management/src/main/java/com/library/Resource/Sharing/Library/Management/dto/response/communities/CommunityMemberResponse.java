package com.library.Resource.Sharing.Library.Management.dto.response.communities;

import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class CommunityMemberResponse {

    Long communityMemberId;

    CommunityResponse communities;

    LocalDateTime joinedAt;

    CommunitymemberRole role;

}
