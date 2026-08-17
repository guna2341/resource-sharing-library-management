package com.library.Resource.Sharing.Library.Management.dto.response.users;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponse {

    String username;

    String profileUrl;

}
