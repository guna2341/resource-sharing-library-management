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
             WHERE b.rootBookId = :rootId
             AND
             b.isCurrent = true
             """)
     Book findCurrentBookById(Long rootId);

     @Query("""
     SELECT
     b FROM Book b
     JOIN FETCH b.author
     WHERE b.rootBookId = :rootId
     ORDER BY b.version
""")
     List<BookDetailsProjection> findBooksByRootId(Long rootId)     ;

     boolean existsByTitle(String title);

     @Query("""
    SELECT MAX(b.version)
    FROM Book b
    WHERE b.rootBookId = :rootBookId
    LIMIT 1
""")
     Integer findMAXVersion(Long rootBookId);

}
