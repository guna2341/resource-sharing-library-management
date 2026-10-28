    package com.library.Resource.Sharing.Library.Management.service;

    import com.library.Resource.Sharing.Library.Management.dto.request.book.BookRequest;
    import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.author.AuthorSummaryResponse;
    import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeEarnedResponse;
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
        private CheckBadgeService badgeService;
        private org.springframework.context.ApplicationEventPublisher eventPublisher;

        private Book findBookById(Long bookId) {
            return bookRepository.findById(bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found."));
        }

        private BookDetailsResponse getBookResponse(Book book) {
            BookDetailsProjection response = bookRepository.findBookById(book.getBookId()).orElseThrow(() -> new ResourceNotFoundException("Book not found."));
            UserSummaryResponse user = UserSummaryResponse.builder()
                    .userId(book.getUploadedBy().getUserId())
                    .username(book.getUploadedBy().getUsername())
                    .profileUrl(book.getUploadedBy().getProfileUrl())
                    .build();
            AuthorSummaryResponse author = AuthorSummaryResponse.builder()
                    .authorId(book.getAuthor().getAuthorId())
                    .name(book.getAuthor().getName())
                    .bio(book.getAuthor().getBio())
                    .profileUrl(book.getAuthor().getProfileUrl())
                    .build();
            return BookDetailsResponse.builder()
                    .bookId(response.getBookId())
                    .title(book.getTitle())
                    .description(book.getDescription())
                    .category(book.getCategory())
                    .tags(book.getTags())
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
                            .category(book.getCategory())
                            .tags(book.getTags())
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

        @Transactional
        public ApiResponse postBook(BookRequest request) {
            if(bookRepository.existsByTitle(request.getTitle())) {
                return new ApiResponse(false, "Book with title already exists.");
            }

            Author author = authorRepository.findById(request.getAuthor()).orElseThrow(() -> new ResourceNotFoundException("Author not found."));

            User user = userRepository.findById(request.getUploadedBy()).orElseThrow(() -> new ResourceNotFoundException("User not found."));
            user.setTotalBooksStock(user.getTotalBooksStock() + 1);
            user.setTotalBooksUploaded(user.getTotalBooksUploaded() + 1);
            userRepository.save(user);
            String coverUrl = (request.getCoverUrl() != null && !request.getCoverUrl().isBlank())
                    ? request.getCoverUrl()
                    : "/images/default-book-cover.jpg";
            Book book = Book.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .tags(request.getTags())
                    .pages(request.getPages())
                    .coverUrl(coverUrl)
                    .fileUrl(request.getFileUrl())
                    .fileType(request.getFileType())
                    .isCurrent(true)
                    .author(author)
                    .uploadedBy(user)
                    .build();
            Book savedBook = bookRepository.save(book);
            savedBook.setRootBookId(savedBook.getBookId());
            Book saved = bookRepository.save(savedBook);
            if (eventPublisher != null) {
                eventPublisher.publishEvent(new com.library.Resource.Sharing.Library.Management.recommendation.event.BookChangeEvent(saved.getBookId(), "CREATED"));
            }
            BadgeEarnedResponse badgeEarnedResponse = badgeService.checkBookBadges(user);
            BookDetailsResponse bookResponse = getBookResponse(saved);
            if (badgeEarnedResponse.getIsBadgeEarned()) {
                return new ApiResponse(true, "Book added successfully", bookResponse, badgeEarnedResponse);
            }
            return new ApiResponse(true, "Book added successfully.", bookResponse);
        }

        @Transactional
        public ApiResponse postBookVersion(BookRequest request, Long bookId) {

            Author author = authorRepository.findById(request.getAuthor()).orElseThrow(() -> new ResourceNotFoundException("Author not found."));

            User user = userRepository.findById(request.getUploadedBy()).orElseThrow(() -> new ResourceNotFoundException("User not found."));

            Book rootBook = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found."));
            Long rootId = rootBook.getRootBookId() != null ? rootBook.getRootBookId() : rootBook.getBookId();

            Integer maxVersion = bookRepository.findMAXVersion(rootId);
            int nextVersion = (maxVersion != null ? maxVersion : 1) + 1;

            String verCoverUrl = (request.getCoverUrl() != null && !request.getCoverUrl().isBlank())
                    ? request.getCoverUrl()
                    : (rootBook.getCoverUrl() != null && !rootBook.getCoverUrl().isBlank() ? rootBook.getCoverUrl() : "/images/default-book-cover.jpg");

            Book book = Book.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .category(request.getCategory() != null ? request.getCategory() : rootBook.getCategory())
                    .tags(request.getTags() != null ? request.getTags() : rootBook.getTags())
                    .pages(request.getPages())
                    .coverUrl(verCoverUrl)
                    .fileUrl(request.getFileUrl())
                    .fileType(request.getFileType())
                    .author(author)
                    .uploadedBy(user)
                    .rootBookId(rootId)
                    .version(nextVersion)
                    .isCurrent(false)
                    .build();
            Book savedBook = bookRepository.save(book);
            BookDetailsResponse bookResponse = getBookResponse(savedBook);

            return new ApiResponse(true, "Book version created successfully.", bookResponse);
        }

        public ApiResponse getBooksByRootId(Long rootId) {

            List<BookDetailsProjection> books = bookRepository.findBooksByRootId(rootId);

            List<BookDetailsResponse> responses = books.stream()
                    .map(book -> {
                        UserSummaryResponse userResponse = null;
                        if (book.getUploadedBy() != null) {
                            userResponse = UserSummaryResponse.builder()
                                    .userId(book.getUploadedBy().getUserId())
                                    .username(book.getUploadedBy().getUsername())
                                    .profileUrl(book.getUploadedBy().getProfileUrl())
                                    .build();
                        }
                        AuthorSummaryResponse authorResponse = null;
                        if (book.getAuthor() != null) {
                            authorResponse = AuthorSummaryResponse.builder()
                                    .authorId(book.getAuthor().getAuthorId())
                                    .name(book.getAuthor().getName())
                                    .bio(book.getAuthor().getBio())
                                    .profileUrl(book.getAuthor().getProfileUrl())
                                    .build();
                        }
                        return BookDetailsResponse.builder()
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
                                .uploadedBy(userResponse)
                                .author(authorResponse)
                                .createdAt(book.getCreatedAt())
                                .updatedAt(book.getUpdatedAt())
                                .build();
                    })
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
            if (Boolean.TRUE.equals(book.getIsCurrent())) {
                return new ApiResponse(false, "Book with id: " + bookId + " is already active");
            }

            Long rootId = book.getRootBookId() != null ? book.getRootBookId() : book.getBookId();
            Book currentBook = bookRepository.findCurrentBookById(rootId);
            if (currentBook != null) {
                currentBook.setIsCurrent(false);
                bookRepository.save(currentBook);
            }
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
                if (eventPublisher != null) {
                    eventPublisher.publishEvent(new com.library.Resource.Sharing.Library.Management.recommendation.event.BookChangeEvent(savedBook.getBookId(), "UPDATED"));
                }

                BookDetailsResponse response = getBookResponse(savedBook);

                return new ApiResponse(
                        true,
                        "Book updated successfully.",
                        response
                );
            }

            @Transactional
        public ApiResponse deleteBook(Long bookId) {
            Book book = findBookById(bookId);
            User user = userRepository.findById(book.getUploadedBy().getUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found for the book."));
            user.setTotalBooksStock(user.getTotalBooksStock() - 1);
            bookRepository.delete(book);
            if (eventPublisher != null) {
                eventPublisher.publishEvent(new com.library.Resource.Sharing.Library.Management.recommendation.event.BookChangeEvent(bookId, "DELETED"));
            }
            return new ApiResponse(true, "Book deleted successfully.");
        }

        @Transactional
        public ApiResponse recordBookDownload(Long bookId, Long userId) {
            Book book = findBookById(bookId);
            User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            long currentDownloads = user.getTotalBooksDownloaded() != null ? user.getTotalBooksDownloaded() : 0L;
            user.setTotalBooksDownloaded(currentDownloads + 1);
            userRepository.save(user);

            BadgeEarnedResponse badgeResponse = badgeService.checkDownloadBadges(user);
            if (badgeResponse != null && Boolean.TRUE.equals(badgeResponse.getIsBadgeEarned())) {
                return new ApiResponse(true, "Book download recorded successfully.", badgeResponse);
            }
            return new ApiResponse(true, "Book download recorded successfully.");
        }

    }
