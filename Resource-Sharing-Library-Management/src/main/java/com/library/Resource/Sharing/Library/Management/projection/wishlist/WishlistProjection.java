package com.library.Resource.Sharing.Library.Management.projection.wishlist;

import java.time.LocalDateTime;

public interface WishlistProjection {

    Long getWishlistId();

    BookSummary getBook();

    interface BookSummary {
        Long getBookId();
        String getTitle();
        String getDescription();
        String getCoverUrl();
    }

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

}
