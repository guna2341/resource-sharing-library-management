package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.ReadingActivity;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.readingActivity.ReadingActivityProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;


public interface ReadingActivityRepository extends JpaRepository<ReadingActivity, Long> {

    boolean existsByUserAndReadingDate(User user, LocalDate date);

    List<ReadingActivity> findByUserOrderByReadingDateDesc(
            User user
    );

    List<ReadingActivityProjection> findByUser_UserIdOrderByReadingDateDesc(Long userId);

}
