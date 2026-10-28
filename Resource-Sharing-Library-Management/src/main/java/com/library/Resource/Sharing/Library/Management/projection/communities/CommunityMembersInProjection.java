package com.library.Resource.Sharing.Library.Management.projection.communities;

import java.time.LocalDateTime;

public interface CommunityMembersInProjection {

    Long getCommunityMemberId();

    CommunitySummary getCommunities();

    LocalDateTime getJoinedAt();


}
