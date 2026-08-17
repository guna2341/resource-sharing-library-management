package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.comments.CommentsRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.CommentMapper;
import com.library.Resource.Sharing.Library.Management.model.Comments;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.comments.CommentsProjection;
import com.library.Resource.Sharing.Library.Management.repository.CommentRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CommentsService {

    private CommentRepository commentRepository;
    private UserRepository userRepository;
    private CommentMapper commentMapper;

    public ApiResponse getAllComments() {
        List<CommentsProjection> comments = commentRepository.getAllComments();
        return new ApiResponse(true, "Comments fetched successfully.", comments);
    }

    public ApiResponse postComment(CommentsRequest request, Long bookId, Long userId) {

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Comments comment = Comments.builder()
                .content(request.getContent())
                .userId(user)
                .bookId(bookId)
                .build();
        Comments savedComment = commentRepository.save(comment);
        return new ApiResponse(true, "Comment added successfully.", savedComment);
    }

    public ApiResponse patchComment(CommentsRequest request, Long commentId) {
        Comments comments = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
        commentMapper.updateComment(request, comments);
        Comments savedComment = commentRepository.save(comments);
        return new ApiResponse(true, "Comment updated successfully.", savedComment);
    }

    public ApiResponse deleteComment(Long commentId) {
        Comments comments = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
        commentRepository.delete(comments);
        return new ApiResponse(true, "Comment deleted successfully.");
    }

}
