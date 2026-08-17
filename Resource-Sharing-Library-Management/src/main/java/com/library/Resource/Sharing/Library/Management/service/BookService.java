    package com.library.Resource.Sharing.Library.Management.service;

    import com.library.Resource.Sharing.Library.Management.dto.request.book.BookRequest;
    import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.author.AuthorSummaryResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.book.BookDetailsResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.book.BookResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
    import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
    import com.library.Resource.Sharing.Library.Management.mapper.BookMapper;
    import com.library.Resource.Sharing.Library.Management.model.*;
    import com.library.Resource.Sharing.Library.Management.projection.book.*;
    import com.library.Resource.Sharing.Library.Management.repository.*;
    import jakarta.transaction.Transactional;
    import lombok.AllArgsConstructor;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    @AllArgsConstructor
    public class BookService {

        private BookRepository bookRepository;
        private UserRepository userRepository;
        private AuthorRepository authorRepository;
        private BookMapper bookMapper;
        private StorageService storageService;

        private Book findBookById(Long bookId) {
            return bookRepository.findById(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found."));
        }

        private BookDetailsResponse getBookResponse(Book book) {
            BookDetailsProjection response = bookRepository.findBookById(book.getBookId()).orElseThrow(() -> new ResourceNotFoundException("Book not found."));
            UserSummaryResponse user = UserSummaryResponse.builder()
                    .username(book.getUploadedBy().getUsername())
                    .profileUrl(book.getUploadedBy().getProfileUrl())
                    .build();
            AuthorSummaryResponse author = AuthorSummaryResponse.builder()
                    .name(book.getAuthor().getName())
                    .bio(book.getAuthor().getBio())
                    .profileUrl(book.getAuthor().getProfileUrl())
                    .build();
            return BookDetailsResponse.builder()
                    .bookId(response.getBookId())
                    .title(book.getTitle())
                    .description(book.getDescription())
                    .version(book.getVersion())
                    .pages(book.getPages())
                    .rootBookId(book.getRootBookId())
                    .coverUrl(book.getCoverUrl())
                    .fileUrl(storageService.getPresignedUrl(book.getFileUrl()))
                    .fileType(book.getFileType())
                    .averageRating(book.getAverageRating())
                    .isCurrent(book.getIsCurrent())
                    .uploadedBy(user)
                    .author(author)
                    .createdAt(book.getCreatedAt())
                    .updatedAt(book.getUpdatedAt())
                    .build();
        }

        public ApiResponse getBooks() {

            List<BookProjection> books =
                    bookRepository.findAllBooks();

            List<BookResponse> responses = books.stream()
                    .map(book -> BookResponse.builder()
                            .bookId(book.getBookId())
                            .title(book.getTitle())
                            .description(book.getDescription())
                            .version(book.getVersion())
                            .pages(book.getPages())

                            .coverUrl(book.getCoverUrl())

                            .fileUrl(storageService.getPresignedUrl(book.getFileUrl()))

                            .fileType(book.getFileType())
                            .averageRating(book.getAverageRating())
                            .isCurrent(book.getIsCurrent())
                            .uploadedBy(book.getUploadedBy().getUsername())
                            .author(book.getAuthor().getName())
                            .createdAt(book.getCreatedAt())
                            .updatedAt(book.getUpdatedAt())
                            .build())
                    .toList();

            return new ApiResponse(
                    true,
                    "Books fetched successfully.",
                    responses
            );
        }


        public ApiResponse getBookById(Long bookId) {
            Book book = findBookById(bookId);
            BookDetailsResponse response = getBookResponse(book);
            return new ApiResponse(true, "Book fetched successfully.", response);
        }

        public ApiResponse postBook(BookRequest request) {

            if(bookRepository.existsByTitle(request.getTitle())) {
                return new ApiResponse(false, "Book with title already exists.");
            }

            Author author = authorRepository.findById(request.getAuthor()).orElseThrow(() -> new ResourceNotFoundException("Author not found."));

            User user = userRepository.findById(request.getUploadedBy()).orElseThrow(() -> new ResourceNotFoundException("User not found."));
            user.setTotalBooksStock(user.getTotalBooksStock() + 1);
            user.setTotalBooksUploaded(user.getTotalBooksUploaded() + 1);
            userRepository.save(user);
            Book book = Book.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .pages(request.getPages())
                    .coverUrl(request.getCoverUrl())
                    .fileUrl(request.getFileUrl())
                    .fileType(request.getFileType())
                    .isCurrent(true)
                    .author(author)
                    .uploadedBy(user)
                    .build();
            Book savedBook = bookRepository.save(book);
            savedBook.setRootBookId(savedBook.getBookId());
            Book saved = bookRepository.save(savedBook);
            BookDetailsResponse bookResponse = getBookResponse(saved);

            return new ApiResponse(true, "Book added successfully.", bookResponse);
        }

        public ApiResponse postBookVersion(BookRequest request, Long bookId) {

            Author author = authorRepository.findById(request.getAuthor()).orElseThrow(() -> new ResourceNotFoundException("Author not found."));

            User user = userRepository.findById(request.getUploadedBy()).orElseThrow(() -> new ResourceNotFoundException("User not found."));

            if (!bookRepository.existsById(bookId)) {
                return new ApiResponse(false, "Book not found.");
            }

            Integer version = bookRepository.findMAXVersion(bookId);

            Book book = Book.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .pages(request.getPages())
                    .fileUrl(storageService.getPresignedUrl(request.getFileUrl()))
                    .rootBookId(bookId)
                    .fileType(request.getFileType())
                    .author(author)
                    .uploadedBy(user)
                    .rootBookId(bookId)
                    .version(version + 1)
                    .build();
            Book savedBook = bookRepository.save(book);
            BookDetailsResponse bookResponse = getBookResponse(savedBook);

            return new ApiResponse(true, "Book version created successfully.", bookResponse);
        }

        public ApiResponse getBooksByRootId(Long rootId) {

            List<BookDetailsProjection> books = bookRepository.findBooksByRootId(rootId);


            List<BookDetailsResponse> responses = books.stream()
                    .map(book -> BookDetailsResponse.builder()
                            .bookId(book.getBookId())
                            .title(book.getTitle())
                            .description(book.getDescription())
                            .version(book.getVersion())
                            .pages(book.getPages())
                            .rootBookId(book.getRootBookId())

                            .coverUrl(book.getCoverUrl())

                            .fileUrl(book.getFileUrl() != null ? storageService.getPresignedUrl(book.getFileUrl()) : null)

                            .fileType(book.getFileType())
                            .averageRating(book.getAverageRating())
                            .isCurrent(book.getIsCurrent())
                            .uploadedBy(book.getUploadedBy())
                            .author(book.getAuthor())
                            .createdAt(book.getCreatedAt())
                            .updatedAt(book.getUpdatedAt())
                            .build()
                    )
                    .toList();

            return new ApiResponse(
                    true,
                    "Books fetched successfully",
                    responses
            );
        }

        @Transactional
        public ApiResponse activeBook(Long bookId) {
            Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book with id: " + bookId + " not found."));
            if (book.getIsCurrent()) {
                return new ApiResponse(false, "Book with id: " + bookId + " is already active");
            }

            Book currentBook = bookRepository.findCurrentBookById(book.getRootBookId());
            currentBook.setIsCurrent(false);
            bookRepository.save(currentBook);
            book.setIsCurrent(true);
            bookRepository.save(book);
            return new ApiResponse(true, "Book with id: " + bookId  + " is activated.");
        }

        @Transactional
        public ApiResponse patchBook(BookRequest request, Long bookId) {

                Book book = findBookById(bookId);

                bookMapper.updateBook(request, book);

                if (request.getAuthor() != null) {
                    Author author = authorRepository.findById(request.getAuthor())
                            .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

                    book.setAuthor(author);
                }

                if (request.getUploadedBy() != null) {
                    User user = userRepository.findById(request.getUploadedBy())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                    book.setUploadedBy(user);
                }

                Book savedBook = bookRepository.save(book);

                BookDetailsResponse response = getBookResponse(savedBook);

                return new ApiResponse(
                        true,
                        "Book updated successfully.",
                        response
                );
            }

        public ApiResponse deleteBook(Long bookId) {
            Book book = findBookById(bookId);
            User user = userRepository.findById(book.getUploadedBy().getUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found for the book."));
            user.setTotalBooksStock(user.getTotalBooksStock() - 1);
            bookRepository.delete(book);
            return new ApiResponse(true, "Book deleted successfully.");
        }

    }
