package com.library.Resource.Sharing.Library.Management.dto.response.messages;

import com.library.Resource.Sharing.Library.Management.dto.response.communities.CommunitySummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class MessageResponse {

    private Long id;

    private CommunitySummaryResponse community;

    private UserSummaryResponse sender;

    private String content;

    private LocalDateTime createdAt;

}
