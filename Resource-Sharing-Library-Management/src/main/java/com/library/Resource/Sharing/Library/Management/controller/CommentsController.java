package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.comments.CommentsRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.CommentsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/comments")
public class CommentsController {

    private CommentsService commentsService;

    @GetMapping
    public ResponseEntity<ApiResponse> getComments() {
        ApiResponse response = commentsService.getAllComments();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{commentId}/{userId}")
    public ResponseEntity<ApiResponse> postComment(@Valid @RequestBody CommentsRequest request, @RequestParam Long commentId, @RequestParam Long userId) {
        ApiResponse response = commentsService.postComment(request, commentId, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{commentId}/{userId}")
    public ResponseEntity<ApiResponse> patchComment(@RequestBody CommentsRequest request, @RequestParam Long commentId) {
        ApiResponse response = commentsService.patchComment(request, commentId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(@RequestParam Long commentId) {
        ApiResponse response = commentsService.deleteComment(commentId);
        return ResponseEntity.ok(response);
    }

}
