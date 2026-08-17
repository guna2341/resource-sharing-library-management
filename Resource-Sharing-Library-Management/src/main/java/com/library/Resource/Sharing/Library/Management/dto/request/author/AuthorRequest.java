package com.library.Resource.Sharing.Library.Management.dto.request.author;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class AuthorRequest {

    @NotBlank
    private String name;

    private String bio;

    @URL(message = "Invalid url")
    private String profileUrl;

}
