package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.UserPoints;
import com.library.Resource.Sharing.Library.Management.projection.userPoints.UserPointsProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {

    List<UserPointsProjection> findByUser_UserId(Long userId);

}
