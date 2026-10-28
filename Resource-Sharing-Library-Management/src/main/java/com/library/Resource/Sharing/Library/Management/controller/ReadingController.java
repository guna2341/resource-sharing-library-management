package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.ReadingService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reading")
@AllArgsConstructor
public class ReadingController {

    private ReadingService readingService;

    @GetMapping("/streak/{userId}")
    public ResponseEntity<ApiResponse> getStreak(@PathVariable Long userId) {
        ApiResponse response = readingService.getStreak(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse> getHistory(@PathVariable Long userId) {
        ApiResponse response = readingService.getHistory(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recordactivity/{userId}")
    public ResponseEntity<ApiResponse> postActivity(@PathVariable Long userId) {
        ApiResponse response = readingService.recordActivity(userId);
        return ResponseEntity.ok(response);
    }

}
