package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityMembersInProjection;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityMembersProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunityMembersRepository extends JpaRepository<CommunityMembers, Long> {

    void deleteByCommunities_CommunityId(Long communityId);

    @Query("""
    SELECT cm
    FROM CommunityMembers cm
    WHERE cm.user.userId = :userId
    AND cm.role <> :role
""")
    List<CommunityMembersInProjection> findAllCommunitiesByUserId(@Param("userId") Long userId, @Param("role")CommunitymemberRole role);


    List<CommunityMembersProjection> findAllCommunitiesByCommunities_CommunityId(@Param("communityId") Long communityId);

    boolean existsByCommunities_CommunityIdAndUser_UserId(Long communityId, Long userId);

    List<CommunityMembers> findByUser_UserId(Long userId);

    @Query("SELECT DISTINCT cm.user.userId FROM CommunityMembers cm WHERE cm.communities.communityId IN :communityIds AND cm.user.userId != :userId")
    List<Long> findPeerUserIdsInCommunities(@Param("communityIds") List<Long> communityIds, @Param("userId") Long userId);

}
