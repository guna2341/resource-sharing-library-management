package com.library.Resource.Sharing.Library.Management.dto.request.book;

import com.library.Resource.Sharing.Library.Management.enums.FileType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String category;

    private String tags;

    @NotNull(message = "Pages is required")
    @Min(1)
    private Integer pages;

    private String coverUrl;

    private Integer version;

    @NotBlank(message = "FileUrl is required")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "File type is required")
    private FileType fileType;

    @NotNull(message = "Uploaded by is required")
    private Long uploadedBy;

    @NotNull(message = "Author is required")
    private Long author;

}
