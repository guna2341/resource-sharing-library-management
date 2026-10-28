package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.book.BookRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.BookService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
@AllArgsConstructor
public class BookController {

    private BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse> getBooks() {
        ApiResponse response = bookService.getBooks();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<ApiResponse> getBookById(@PathVariable Long bookId) {
        ApiResponse response = bookService.getBookById(bookId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> postBook(@Valid @RequestBody BookRequest request) {
        ApiResponse response = bookService.postBook(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/newVersion/{bookId}")
    public ResponseEntity<ApiResponse> postVersion(@PathVariable Long bookId, @Valid @RequestBody BookRequest request) {
        ApiResponse response = bookService.postBookVersion(request, bookId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rootId/{rootId}")
    public ResponseEntity<ApiResponse> getBooksByRootId(@PathVariable Long rootId) {
        ApiResponse response = bookService.getBooksByRootId(rootId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activateVersion/{bookId}")
    public ResponseEntity<ApiResponse> activateBook(@PathVariable Long bookId) {
        ApiResponse response = bookService.activeBook(bookId);
        return ResponseEntity.ok(response);
    }

    //    working
    @PatchMapping("{bookId}")
    public ResponseEntity<ApiResponse> patchBook(@RequestBody BookRequest request, @PathVariable Long bookId) {
        ApiResponse response = bookService.patchBook(request, bookId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<ApiResponse> deleteBook(@PathVariable Long bookId) {
        ApiResponse response = bookService.deleteBook(bookId);
//        modify user to reduce in stock count
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookId}/download/{userId}")
    public ResponseEntity<ApiResponse> recordDownload(@PathVariable Long bookId, @PathVariable Long userId) {
        ApiResponse response = bookService.recordBookDownload(bookId, userId);
        return ResponseEntity.ok(response);
    }

}
