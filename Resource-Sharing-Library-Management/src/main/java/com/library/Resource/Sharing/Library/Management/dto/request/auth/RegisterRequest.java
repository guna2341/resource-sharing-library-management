package com.library.Resource.Sharing.Library.Management.dto.request.auth;

import com.library.Resource.Sharing.Library.Management.constants.Regex;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Pattern(
            regexp = Regex.USERNAME_REGEX,
            message = "Username can contain only letters, numbers and underscore"
    )
    private String username;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = Regex.PASSWORD_REGEX,
            message = "Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
    )
    private String password;

}
