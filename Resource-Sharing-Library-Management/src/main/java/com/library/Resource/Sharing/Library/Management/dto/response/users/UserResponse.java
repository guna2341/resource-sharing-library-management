package com.library.Resource.Sharing.Library.Management.dto.response.users;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.enums.UserRole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "userId",
        "username",
        "email",
        "role",
        "profileUrl",
        "isVerified",
        "totalBooksStock",
        "totalBooksUploaded",
        "createdAt",
        "updatedAt"
})
public class UserResponse {

    Long userId;

    String username;

    String email;

    String phone;

    String profileUrl;

    Boolean isVerified;

    Long totalBooksStock;

    Long totalBooksUploaded;

    UserRole role;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

}
