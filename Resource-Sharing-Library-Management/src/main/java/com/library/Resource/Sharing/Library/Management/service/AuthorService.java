package com.library.Resource.Sharing.Library.Management.service;


import com.library.Resource.Sharing.Library.Management.dto.request.author.AuthorRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.AuthorMapper;
import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.repository.AuthorRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AuthorService {

    private AuthorRepository authorRepository;
    private AuthorMapper authorMapper;
    private com.library.Resource.Sharing.Library.Management.repository.AuthorFollowRepository authorFollowRepository;
    private com.library.Resource.Sharing.Library.Management.repository.UserRepository userRepository;

    private Author findAuthorById(Long authorId) {
        return authorRepository.findById(authorId).orElseThrow(() -> new ResourceNotFoundException("Author is not found."));
    }

    public ApiResponse getAuthors() {
        List<Author> list = authorRepository.findAll();
        return new ApiResponse(true, "Author fetched successfully.", list);
    }

    public ApiResponse getAuthorById(Long authorId) {
        Author author = findAuthorById(authorId);
        return new ApiResponse(true, "Author fetched successfully.", author);
    }

    public ApiResponse postAuthor(AuthorRequest request) {
        String profileUrl = (request.getProfileUrl() != null && !request.getProfileUrl().isBlank())
                ? request.getProfileUrl()
                : "/images/default-author-avatar.jpg";
        Author author = Author.builder()
                .bio(request.getBio())
                .name(request.getName())
                .profileUrl(profileUrl)
                .build();
        Author savedAuthor = authorRepository.save(author);
        return new ApiResponse(true, "Author added successfully.", savedAuthor);
    }

    public ApiResponse patchAuthor(Long authorId, AuthorRequest request) {
        Author author = findAuthorById(authorId);
        authorMapper.updateAuthorFromRequest(request, author);
        Author savedAuthor = authorRepository.save(author);
        return new ApiResponse(true, "Author updated successfully.", savedAuthor);
    }

    public ApiResponse deleteAuthor(Long authorId) {
        Author author = findAuthorById(authorId);
        authorRepository.delete(author);
        return new ApiResponse(true, "Author deleted successfully.");
    }

    @org.springframework.transaction.annotation.Transactional
    public ApiResponse followAuthor(Long authorId, Long userId) {
        Author author = findAuthorById(authorId);
        com.library.Resource.Sharing.Library.Management.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!authorFollowRepository.existsByUser_UserIdAndAuthor_AuthorId(userId, authorId)) {
            com.library.Resource.Sharing.Library.Management.model.AuthorFollow follow =
                    com.library.Resource.Sharing.Library.Management.model.AuthorFollow.builder()
                            .user(user)
                            .author(author)
                            .build();
            authorFollowRepository.save(follow);
        }
        return new ApiResponse(true, "Successfully followed author " + author.getName());
    }

    @org.springframework.transaction.annotation.Transactional
    public ApiResponse unfollowAuthor(Long authorId, Long userId) {
        authorFollowRepository.deleteByUser_UserIdAndAuthor_AuthorId(userId, authorId);
        return new ApiResponse(true, "Successfully unfollowed author.");
    }

    public ApiResponse getFollowedAuthorIds(Long userId) {
        List<Long> followed = authorFollowRepository.findFollowedAuthorIds(userId);
        return new ApiResponse(true, "Followed authors retrieved.", followed);
    }

    public ApiResponse deleteUser(Long authorId) {
        return deleteAuthor(authorId);
    }
}
