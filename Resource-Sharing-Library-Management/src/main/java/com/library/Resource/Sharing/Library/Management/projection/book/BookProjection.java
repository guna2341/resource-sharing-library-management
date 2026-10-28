package com.library.Resource.Sharing.Library.Management.projection.book;

import com.library.Resource.Sharing.Library.Management.enums.FileType;

import java.time.LocalDateTime;

public interface BookProjection {

    Long getBookId();

    String getTitle();

    String getDescription();

    String getCategory();

    String getTags();

    Integer getVersion();

    Integer getPages();

    String getCoverUrl();

    String getFileUrl();

    FileType getFileType();

    Double getAverageRating();

    Boolean getIsCurrent();

    UserSummaryProjection getUploadedBy();

    AuthorSummaryProjection getAuthor();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

}
