package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Wishlist;
import com.library.Resource.Sharing.Library.Management.projection.wishlist.WishlistProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("""
            SELECT w
            FROM Wishlist w
            WHERE w.user.userId = :uId
            """)
    List<WishlistProjection> getWishlist(Long uId);

    Boolean existsByUser_UserId(Long userId);

    List<Wishlist> findByUser_UserId(Long userId);
}
