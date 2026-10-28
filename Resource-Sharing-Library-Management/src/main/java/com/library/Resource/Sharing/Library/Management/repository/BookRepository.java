package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.projection.book.BookDetailsProjection;
import com.library.Resource.Sharing.Library.Management.projection.book.BookProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

     @Query("""
    SELECT
        b
    FROM Book b
    JOIN FETCH b.author
    JOIN FETCH b.uploadedBy
    WHERE b.isCurrent = true
    """)
     List<BookProjection> findAllBooks();

     @Query("""
     SELECT\s
        b
     FROM Book b
             JOIN FETCH b.author
             JOIN FETCH b.uploadedBy
             WHERE b.bookId = :bookId
            \s""")
     Optional<BookDetailsProjection> findBookById(Long bookId);

     @Query("""
             SELECT
             b
             FROM Book b
             WHERE (b.rootBookId = :rootId OR (b.rootBookId IS NULL AND b.bookId = :rootId))
             AND
             b.isCurrent = true
             """)
     Book findCurrentBookById(Long rootId);

     @Query("""
     SELECT
     b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.rootBookId = :rootId OR (b.rootBookId IS NULL AND b.bookId = :rootId)
     ORDER BY b.version
""")
     List<BookDetailsProjection> findBooksByRootId(Long rootId);

     boolean existsByTitle(String title);

     @Query("""
    SELECT MAX(b.version)
    FROM Book b
    WHERE b.rootBookId = :rootBookId OR (b.rootBookId IS NULL AND b.bookId = :rootBookId)
""")
     Integer findMAXVersion(Long rootBookId);

     @Query("""
     SELECT b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.isCurrent = true
     """)
     List<Book> findAllCurrentBooksWithDetails();

     @Query("""
     SELECT b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.bookId IN :bookIds
     """)
     List<Book> findAllByIdInWithDetails(@org.springframework.data.repository.query.Param("bookIds") java.util.Collection<Long> bookIds);

     @Query("""
     SELECT b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.isCurrent = true AND LOWER(b.category) = LOWER(:category)
     """)
     List<Book> findByCategoryIgnoreCase(@org.springframework.data.repository.query.Param("category") String category);

     @Query("""
     SELECT b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.isCurrent = true AND b.author.authorId IN :authorIds
     """)
     List<Book> findByAuthorIds(@org.springframework.data.repository.query.Param("authorIds") java.util.Collection<Long> authorIds);

     @Query("""
     SELECT b FROM Book b
     JOIN FETCH b.author
     JOIN FETCH b.uploadedBy
     WHERE b.isCurrent = true
     ORDER BY b.averageRating DESC, b.createdAt DESC
     """)
     List<Book> findTrendingBooks();

}
