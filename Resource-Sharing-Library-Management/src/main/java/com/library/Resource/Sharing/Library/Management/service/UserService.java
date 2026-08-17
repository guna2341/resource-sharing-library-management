package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.auth.PasswordRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.users.UserRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.UserMapper;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {

    private UserRepository userRepository;
    private UserMapper userMapper;
    private PasswordEncoder passwordEncoder;

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

    public UserResponse getUser(Long userId) {
        User user = findUserById(userId);
        return getUserResponse(user);
    }

    @Transactional
    public ApiResponse patchUser(Long userId, UserRequest request) {
        User user = findUserById(userId);
        userMapper.updateUserFromRequest(request, user);
        User savedUser = userRepository.save(user);
        return new ApiResponse(true, "User updated successfully.",getUserResponse(savedUser));
    }
    @Transactional
    public ApiResponse patchPassword(Long userId, String password) {
        User user = findUserById(userId);
        String hashedPassword = passwordEncoder.encode(password);
        user.setPassword(hashedPassword);
        userRepository.save(user);
        return new ApiResponse(true, "Password updated successfully.");
    }

    public ApiResponse verifyEmail(Long userId) {
//        logic for verify email
        User user = findUserById(userId);
        if (user.getIsVerified()) {
            return new ApiResponse(false, "User email is already verified.");
        }
        user.setIsVerified(true);
        return new ApiResponse(true, "User email is verified.");
    }

}
