package com.library.Resource.Sharing.Library.Management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class FieldErrorResponse {

    private String field;
    private String message;

}
