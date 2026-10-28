package com.library.Resource.Sharing.Library.Management.dto.response.bookMark;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.dto.response.book.BookSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@JsonPropertyOrder({
        "bookMarkId",
        "page",
        "book",
        "createdAt",
        "updatedAt"
})
public class BookMarkResponse {

    Long bookMarkId;

    BookSummaryResponse book;

    Integer page;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

}
