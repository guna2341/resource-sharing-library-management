package com.library.Resource.Sharing.Library.Management.dto.request.communities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMessageResponse {

    Long communityId;

    Long userId;

    String username;

    String message;

}
