package com.library.Resource.Sharing.Library.Management.projection.messages;

import com.library.Resource.Sharing.Library.Management.projection.book.UserSummaryProjection;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunitySummary;

import java.time.LocalDateTime;

public interface MessageProjection {

    Long getMessageId();

    CommunitySummary getCommunities();

    UserSummaryProjection getSenderId();

    String getContent();

    LocalDateTime getCreatedAt();

}
