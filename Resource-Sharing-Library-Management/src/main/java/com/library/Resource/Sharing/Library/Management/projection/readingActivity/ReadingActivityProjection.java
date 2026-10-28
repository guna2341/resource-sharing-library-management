package com.library.Resource.Sharing.Library.Management.projection.readingActivity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ReadingActivityProjection {

    Long getActivityId();

    LocalDate getReadingDate();

    LocalDateTime getCreatedAt();

}
