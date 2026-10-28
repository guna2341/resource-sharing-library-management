package com.library.Resource.Sharing.Library.Management.projection.bookMark;


import java.time.LocalDateTime;

public interface BookMarkProjection {

    Long getBookMarkId();

    BookProjection getBook();

    interface BookProjection {
        Long getBookId();
        String getTitle();
        String getCoverUrl();
    }

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

}
