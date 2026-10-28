package com.library.Resource.Sharing.Library.Management.dto.response.book;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.dto.response.author.AuthorSummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.enums.FileType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonPropertyOrder({
        "bookId",
        "title",
        "description",
        "version",
        "pages",
        "coverUrl",
        "fileUrl",
        "fileType",
        "averageRating",
        "isCurrent",
        "uploadedBy",
        "author",
        "createdAt",
        "updatedAt"
})
public class BookDetailsResponse {

    private Long bookId;

    private String title;

    private String description;

    private String category;

    private String tags;

    private Integer version;

    private Integer pages;

    private Long rootBookId;

    private String coverUrl;

    private String fileUrl;

    private FileType fileType;

    private Double averageRating;

    private Boolean isCurrent;

    private UserSummaryResponse uploadedBy;

    private AuthorSummaryResponse author;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
