package com.library.Resource.Sharing.Library.Management.projection.userBadges;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;

import java.time.LocalDateTime;

@JsonPropertyOrder({
        "getUserBadgeId",
        "badge",
        "createdAt"

})
public interface UserBadgeProjection {

    Long getUserBadgeId();


    BadgeSummary getBadge();

    interface BadgeSummary {

         Long getBadgeId();

         String getName();

         String getDescription();

        String getIconUrl();

        Long getPoints();

        BadgeRequirementType getRequirementType();

        Integer getRequirementValue();
    }

    LocalDateTime getCreatedAt();

}


