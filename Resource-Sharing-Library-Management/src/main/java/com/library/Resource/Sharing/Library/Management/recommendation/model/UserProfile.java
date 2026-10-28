package com.library.Resource.Sharing.Library.Management.recommendation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    private Long userId;

    @Builder.Default
    private SparseVector interestVector = new SparseVector();

    @Builder.Default
    private Set<Long> excludedBookIds = new HashSet<>();

    @Builder.Default
    private Map<String, Double> categoryAffinities = new HashMap<>();

    @Builder.Default
    private Set<Long> followedAuthorIds = new HashSet<>();

    private String topCategory;
    private String topAuthorName;

    @Builder.Default
    private int totalInteractions = 0;

    public boolean hasActivity() {
        return totalInteractions > 0 || !followedAuthorIds.isEmpty();
    }
}
