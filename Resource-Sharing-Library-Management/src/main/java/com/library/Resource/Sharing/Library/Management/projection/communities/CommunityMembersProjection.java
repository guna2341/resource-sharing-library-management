package com.library.Resource.Sharing.Library.Management.projection.communities;

import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.projection.book.UserSummaryProjection;

import java.time.LocalDateTime;

public interface CommunityMembersProjection {

    Long getCommunityMemberId();

    UserSummaryProjection getUser();

    LocalDateTime getJoinedAt();

    CommunitymemberRole getRole();

}
