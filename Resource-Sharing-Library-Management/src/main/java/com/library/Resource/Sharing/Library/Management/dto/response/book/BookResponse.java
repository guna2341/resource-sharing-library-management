package com.library.Resource.Sharing.Library.Management.dto.response.book;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.enums.FileType;
import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.model.User;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

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
public class BookResponse {

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

    private Boolean isCurrent;

    private String uploadedBy;

    private String author;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
