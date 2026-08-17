package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.users.AddUserRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AdminService {

    private UserRepository userRepository;

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not found"));
    }

    private UserResponse getUserResponse(User user) {
        return UserResponse.builder()
                .email(user.getEmail())
                .phone(user.getPhone())
                .createdAt(user.getCreatedAt())
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .profileUrl(user.getProfileUrl())
                .totalBooksStock(user.getTotalBooksStock())
                .totalBooksUploaded(user.getTotalBooksUploaded())
                .updatedAt(user.getUpdatedAt())
                .userId(user.getUserId())
                .username(user.getUsername())
                .build();
    }

    public ApiResponse addUser(AddUserRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        User savedUser = userRepository.save(user);
        return new ApiResponse(true, "User added successfully.", getUserResponse(savedUser));
    }

    @Transactional
    public ApiResponse deleteUser(Long userId) {
//        logic for delete user
        User user = findUserById(userId);
        userRepository.delete(user);
        return new ApiResponse(true, "User deleted successfully.");
    }


}
