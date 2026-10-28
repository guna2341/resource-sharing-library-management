package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.UserPointsService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/userpoints")
@AllArgsConstructor
public class UserPointsController {

    private UserPointsService userPointsService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUserPoints(@PathVariable Long userId) {
        ApiResponse response = userPointsService.getUserPoints(userId);
        return ResponseEntity.ok(response);
    }

}
