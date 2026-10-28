package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.BookMark;
import com.library.Resource.Sharing.Library.Management.projection.bookMark.BookMarkProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookMarkRepository extends JpaRepository<BookMark, Long> {

    @Query("""
            SELECT b
            FROM BookMark b
            WHERE b.user.userId = :uId
            """)
    List<BookMarkProjection> getBookMarks(Long uId);

    @Query("""
            SELECT b
            FROM BookMark b
            WHERE 
            b.user.userId = :uId
            AND
            b.book.bookId = :bId
            """)
    List<BookMarkProjection> getBookMarksByBookId(Long uId, Long bId);

    List<BookMark> findByUser_UserId(Long userId);

}
