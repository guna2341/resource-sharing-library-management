package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.comments.CommentsRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.CommentsService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/comments")
@AllArgsConstructor
public class CommentsController {

    private CommentsService commentsService;

    @GetMapping("/{bookId}")
    public ResponseEntity<ApiResponse> getComments(@PathVariable Long bookId) {
        ApiResponse response = commentsService.getAllComments(bookId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/{bookId}")
    public ResponseEntity<ApiResponse> postComment(@Valid @RequestBody CommentsRequest request, @PathVariable Long bookId, @PathVariable Long userId) {
        ApiResponse response = commentsService.postComment(request, bookId, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<ApiResponse> patchComment(@RequestBody CommentsRequest request, @PathVariable Long commentId) {
        ApiResponse response = commentsService.patchComment(request, commentId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable Long commentId) {
        ApiResponse response = commentsService.deleteComment(commentId);
        return ResponseEntity.ok(response);
    }

}
