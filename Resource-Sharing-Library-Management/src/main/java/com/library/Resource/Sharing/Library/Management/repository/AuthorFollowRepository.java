package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.AuthorFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AuthorFollowRepository extends JpaRepository<AuthorFollow, Long> {

    List<AuthorFollow> findByUser_UserId(Long userId);

    Optional<AuthorFollow> findByUser_UserIdAndAuthor_AuthorId(Long userId, Long authorId);

    boolean existsByUser_UserIdAndAuthor_AuthorId(Long userId, Long authorId);

    void deleteByUser_UserIdAndAuthor_AuthorId(Long userId, Long authorId);

    @Query("SELECT af.author.authorId FROM AuthorFollow af WHERE af.user.userId = :userId")
    List<Long> findFollowedAuthorIds(@Param("userId") Long userId);

    @Query("SELECT COUNT(af) FROM AuthorFollow af WHERE af.author.authorId = :authorId")
    long countFollowersByAuthorId(@Param("authorId") Long authorId);
}
