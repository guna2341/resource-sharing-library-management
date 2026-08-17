package com.library.Resource.Sharing.Library.Management.dto.request.users;

import com.library.Resource.Sharing.Library.Management.constants.Regex;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AddUserRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(
            regexp = Regex.PASSWORD_REGEX,
            message = "Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
    )
    @NotBlank(message = "Password is required")
    private String password;
}
