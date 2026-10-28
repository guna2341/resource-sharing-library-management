package com.library.Resource.Sharing.Library.Management.dto.response.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LeaderboardResponse {

    private Long userId;
    private String username;
    private String profileUrl;
    private Double points;
    private Long rank;


}
