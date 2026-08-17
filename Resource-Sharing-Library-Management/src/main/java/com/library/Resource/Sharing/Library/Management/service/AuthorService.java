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
        Author author = Author.builder()
                .bio(request.getBio())
                .name(request.getName())
                .profileUrl(request.getProfileUrl())
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

    public ApiResponse deleteUser(Long authorId) {
        Author author = findAuthorById(authorId);
        authorRepository.delete(author);
        return new ApiResponse(true, "Author deleted successfully.");
    }

}
