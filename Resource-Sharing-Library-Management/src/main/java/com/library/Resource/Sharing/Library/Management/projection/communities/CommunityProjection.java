package com.library.Resource.Sharing.Library.Management.projection.communities;

import com.library.Resource.Sharing.Library.Management.projection.book.UserSummaryProjection;

import java.time.LocalDateTime;

public interface CommunityProjection {

    Long getCommunityId();

    String getName();

    String getDescription();

    UserSummaryProjection getCreatedBy();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

}

