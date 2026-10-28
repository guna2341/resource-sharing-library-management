package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import com.library.Resource.Sharing.Library.Management.model.Badges;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badges, Long> {

    List<Badges> findByRequirementTypeAndActiveTrue(BadgeRequirementType badgeRequirementType);

}
