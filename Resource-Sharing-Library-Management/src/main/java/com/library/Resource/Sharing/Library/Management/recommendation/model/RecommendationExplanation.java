package com.library.Resource.Sharing.Library.Management.recommendation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationExplanation {

    private String primaryReason;
    private String signalType; // CONTENT_SIMILARITY, USER_PREFERENCE, NETWORK_FOLLOW, COMMUNITY_POPULAR, TRENDING, COLD_START
    private Double confidence;
    private List<String> matchedFeatures;
}
