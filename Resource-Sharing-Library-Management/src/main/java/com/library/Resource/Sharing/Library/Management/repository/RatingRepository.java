package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Ratings;
import com.library.Resource.Sharing.Library.Management.projection.ratings.RatingProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RatingRepository extends JpaRepository<Ratings, Long> {

    @Query("""
            SELECT r\s
            FROM Ratings r
            WHERE r.book.bookId = :bId
           \s""")
    List<RatingProjection> findAllRatings(Long bId);

    @Query("""
            SELECT r\s
            FROM Ratings r
            WHERE r.book.bookId = :bId
            AND
            r.user.userId = :uId
           \s""")
    RatingProjection findUserRating(Long bId, Long uId);

    long countByUser_UserId(Long userId);

    List<Ratings> findByUser_UserId(Long userId);

    java.util.Optional<Ratings> findByUser_UserIdAndBook_BookId(Long userId, Long bookId);

    List<Ratings> findByBook_BookId(Long bookId);

    void deleteByUser_UserIdAndBook_BookId(Long userId, Long bookId);

}
