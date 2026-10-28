package com.library.Resource.Sharing.Library.Management.recommendation.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.dto.response.author.AuthorSummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.enums.FileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({
        "bookId",
        "title",
        "description",
        "category",
        "tags",
        "version",
        "pages",
        "coverUrl",
        "fileUrl",
        "fileType",
        "averageRating",
        "author",
        "uploadedBy",
        "score",
        "matchPercentage",
        "recommendationReason",
        "signalType",
        "matchedFeatures",
        "createdAt"
})
public class RecommendedResourceDto {

    private Long bookId;
    private String title;
    private String description;
    private String category;
    private String tags;
    private Integer version;
    private Integer pages;
    private String coverUrl;
    private String fileUrl;
    private FileType fileType;
    private Double averageRating;
    private AuthorSummaryResponse author;
    private UserSummaryResponse uploadedBy;

    // Recommendation Explainability Metadata
    private Double score;
    private Integer matchPercentage;
    private String recommendationReason;
    private String signalType;
    private List<String> matchedFeatures;

    private LocalDateTime createdAt;
}
