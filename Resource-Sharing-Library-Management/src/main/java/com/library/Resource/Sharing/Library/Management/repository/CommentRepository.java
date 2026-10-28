package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Comments;
import com.library.Resource.Sharing.Library.Management.projection.comments.CommentsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comments, Long> {

    @Query("""
            SELECT c
            FROM Comments c
            WHERE bookId = :bId
            """)
    List<CommentsProjection> getAllComments(Long bId);

}
