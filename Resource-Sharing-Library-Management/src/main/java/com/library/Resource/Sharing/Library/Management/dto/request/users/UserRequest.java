package com.library.Resource.Sharing.Library.Management.dto.request.users;

import com.library.Resource.Sharing.Library.Management.constants.Regex;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UserRequest {

    private String username;

    @Pattern(
            regexp = Regex.PHONE_REGEX,
            message = "Invalid phone number"
    )
    private String phone;

    @URL(message = "Invalid url")
    private String profileUrl;

}
