package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.auth.PasswordRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.users.UserRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserResponse;
import com.library.Resource.Sharing.Library.Management.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/v1/users")
@AllArgsConstructor
public class UserController {

    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUser(@PathVariable Long userId) {
        UserResponse user = userService.getUser(userId);
        ApiResponse response = new ApiResponse(true, "User fetched successfully.", user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse> patchUser(@PathVariable Long userId, @Valid @RequestBody UserRequest request) {
        ApiResponse response = userService.patchUser(userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/password")
    public ResponseEntity<ApiResponse> patchPassword(@PathVariable Long userId, @Valid @RequestBody PasswordRequest request) {
        ApiResponse response = userService.patchPassword(userId, request.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/email")
    public ResponseEntity<ApiResponse> verifyEmail(@PathVariable Long userId) {
        ApiResponse response = userService.verifyEmail(userId);
        return ResponseEntity.ok(response);
    }

}
