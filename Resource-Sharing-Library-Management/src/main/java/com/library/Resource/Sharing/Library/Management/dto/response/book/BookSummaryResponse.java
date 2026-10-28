package com.library.Resource.Sharing.Library.Management.dto.response.book;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookSummaryResponse {

    Long bookId;

    String title;

    String description;

}
