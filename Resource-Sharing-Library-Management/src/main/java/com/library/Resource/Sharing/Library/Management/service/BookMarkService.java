package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.bookMark.BookMarkRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.book.BookSummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.bookMark.BookMarkResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.model.BookMark;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.bookMark.BookMarkProjection;
import com.library.Resource.Sharing.Library.Management.repository.BookMarkRepository;
import com.library.Resource.Sharing.Library.Management.repository.BookRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BookMarkService {

    private BookMarkRepository bookMarkRepository;
    private UserRepository userRepository;
    private BookRepository bookRepository;

    private BookMarkResponse getBookMarkResponse(BookMark bookMark) {

        Book book = bookMark.getBook();

        BookSummaryResponse bookSummaryResponse = BookSummaryResponse.builder()
                .bookId(book.getBookId())
                .title(book.getTitle())
                .description(book.getDescription())
                .build();

        return BookMarkResponse.builder()
                .bookMarkId(bookMark.getBookMarkId())
                .book(bookSummaryResponse)
                .page(bookMark.getPage())
                .createdAt(bookMark.getCreatedAt())
                .updatedAt(bookMark.getUpdatedAt())
                .build();
    }

    public ApiResponse getBookMarks(Long userId) {

        List<BookMarkProjection> bookmarks = bookMarkRepository.getBookMarks(userId);

        return new ApiResponse(true, "Bookmarks fetched successfully.", bookmarks);
    }

    public ApiResponse getBookMarksByBookId(Long userId, Long bookId) {
        List<BookMarkProjection> bookmarks = bookMarkRepository.getBookMarksByBookId(userId, bookId);
        return new ApiResponse(true, "Bookmarks fetched successfully.", bookmarks);
    }

    public ApiResponse addBookMark(Long userId, Long bookId, BookMarkRequest request) {

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        BookMark bookMark = BookMark.builder()
                .user(user)
                .book(book)
                .page(request.getPage())
                .build();
        BookMark savedBookMark = bookMarkRepository.save(bookMark);

        BookMarkResponse bookMarkResponse = getBookMarkResponse(savedBookMark);

        return new ApiResponse(true, "Bookmark added.", bookMarkResponse);
    }

    public ApiResponse removeBookMark(Long bookMarkId) {

        BookMark bookMark = bookMarkRepository.findById(bookMarkId).orElseThrow(() -> new ResourceNotFoundException("Book mark not found with id: " + bookMarkId));

        bookMarkRepository.delete(bookMark);

        return new ApiResponse(true, "Bookmark removed with id: " + bookMarkId);
    }

}
