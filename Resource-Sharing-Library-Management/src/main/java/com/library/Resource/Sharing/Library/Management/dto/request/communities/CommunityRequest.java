package com.library.Resource.Sharing.Library.Management.dto.request.communities;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    String name;

    String description;

    @URL(message = "Enter a valid url")
    String profileUrl;

    Long createdBy;

}
