package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Communities;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommunityRepository extends JpaRepository<Communities, Long> {

    @Query("""
        SELECT c
        FROM Communities c
    """)
    List<CommunityProjection> findAllCommunities();

    List<CommunityProjection> findAllByCreatedBy_UserId(Long userId);

    boolean existsByName(String name);

}
