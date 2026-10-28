package com.library.Resource.Sharing.Library.Management.recommendation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "recommendation")
public class RecommendationProperties {

    /**
     * Weight for Content-based TF-IDF similarity (0.0 to 1.0)
     */
    private double contentWeight = 0.50;

    /**
     * Weight for User Preference profile match (0.0 to 1.0)
     */
    private double preferenceWeight = 0.25;

    /**
     * Weight for Network relevance (followed authors, community peers) (0.0 to 1.0)
     */
    private double networkWeight = 0.15;

    /**
     * Weight for overall popularity (ratings & downloads) (0.0 to 1.0)
     */
    private double popularityWeight = 0.05;

    /**
     * Weight for document freshness / recency (0.0 to 1.0)
     */
    private double freshnessWeight = 0.05;

    /**
     * Default number of recommendations returned
     */
    private int defaultLimit = 10;

    /**
     * Maximum limit allowed for pagination
     */
    private int maxLimit = 50;

    /**
     * Minimum score threshold to consider a resource relevant
     */
    private double minScoreThreshold = 0.01;

    /**
     * Whether in-memory TF-IDF vector caching is enabled
     */
    private boolean cacheEnabled = true;
}
