package com.library.Resource.Sharing.Library.Management.projection.userPoints;

import java.time.LocalDateTime;

public interface UserPointsProjection {

    Long getUserPointId();

    Long getPoints();

    BadgeSummary getBadge();

    interface BadgeSummary {
        Long getBadgeId();
        String getName();
        String getIconUrl();
    }

    LocalDateTime getCreatedAt();

}
