package com.library.Resource.Sharing.Library.Management.dto.request.auth;

import com.library.Resource.Sharing.Library.Management.constants.Regex;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PasswordRequest {

    @Pattern(
            regexp = Regex.PASSWORD_REGEX,
            message = "Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
    )
    String password;

}
