package com.library.Resource.Sharing.Library.Management.controller;


import com.library.Resource.Sharing.Library.Management.dto.request.author.AuthorRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.service.AuthorService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/author")
@AllArgsConstructor
public class AuthorController {

    private AuthorService authorService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAuthors() {
        ApiResponse response = authorService.getAuthors();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{authorId}")
    public ResponseEntity<ApiResponse> getAuthorById(@PathVariable Long authorId) {
        ApiResponse response = authorService.getAuthorById(authorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> postAuthor(@Valid @RequestBody AuthorRequest request) {
        ApiResponse response = authorService.postAuthor(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{authorId}")
    public ResponseEntity<ApiResponse> patchAuthor(@PathVariable Long authorId, @RequestBody AuthorRequest request) {
        ApiResponse response = authorService.patchAuthor(authorId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{authorId}")
    public ResponseEntity<ApiResponse> deleteAuthor(@PathVariable Long authorId) {
        ApiResponse response = authorService.deleteUser(authorId);
        return ResponseEntity.ok(response);
    }


}


