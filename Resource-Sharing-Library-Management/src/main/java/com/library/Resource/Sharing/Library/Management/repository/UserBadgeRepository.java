package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.Badges;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.model.UserBadges;
import com.library.Resource.Sharing.Library.Management.projection.userBadges.UserBadgeProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadges, Long> {

    boolean existsByUserAndBadge(User user, Badges badge);

    List<UserBadgeProjection> findByUser_UserId(Long userId);

}
