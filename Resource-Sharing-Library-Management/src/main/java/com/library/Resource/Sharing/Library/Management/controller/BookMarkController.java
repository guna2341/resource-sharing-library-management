package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.bookMark.BookMarkRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.BookMarkService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookmark")
@AllArgsConstructor
public class BookMarkController {

    private BookMarkService bookMarkService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getBookMarks(@PathVariable Long userId) {
        ApiResponse response = bookMarkService.getBookMarks(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/{bookId}")
    public ResponseEntity<ApiResponse> getBookMarksByBookId(@PathVariable Long userId, @PathVariable Long bookId) {
        ApiResponse response = bookMarkService.getBookMarksByBookId(userId, bookId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/{bookId}")
    public ResponseEntity<ApiResponse> addBookMark(@PathVariable Long userId, @PathVariable Long bookId,@Valid @RequestBody BookMarkRequest request) {
        ApiResponse response = bookMarkService.addBookMark(userId, bookId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookMarkId}")
    public ResponseEntity<ApiResponse> removeBookMark(@PathVariable Long bookMarkId) {
        ApiResponse response = bookMarkService.removeBookMark(bookMarkId);
        return ResponseEntity.ok(response);
    }

}
