package com.library.Resource.Sharing.Library.Management.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class AuthResponse {

    private final Boolean success;
    private final String message;
    private final String token;

    public String toString() {
        return "Success: " + success + " message: " + message + " token: " + token;
    }

}
