package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.auth.LoginRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.auth.RegisterRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.auth.AuthResponse;
import com.library.Resource.Sharing.Library.Management.exception.*;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);

    public AuthResponse register(RegisterRequest request) {

        LOGGER.debug("Registering user");

//        check for duplicate email
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already exists.");
            }

//         checks for username
           if (userRepository.existsByUsername(request.getUsername())) {
               throw new DuplicateResourceException("Username already exists.");
           }

//           save to db
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        User savedUser = userRepository.save(user);

//        Generate token
        String token = jwtService.generateToken(savedUser);

//        return success
        return new AuthResponse(true, "User registered successfully", token);
    }

    public AuthResponse login(LoginRequest request) {

        LOGGER.debug("Logging user");

//        Getting user
        Optional<User> user = userRepository.findByEmail(request.getEmail());

//        checking user exists
        if (user.isEmpty()) {
            throw new ResourceNotFoundException("User is not registered");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            throw new BadRequest("Invalid email or password");
        }

//        Generate token
        String token = jwtService.generateToken(user.get());

//        return success
        return new AuthResponse(true, "User logged in successfully", token);
    }

}
