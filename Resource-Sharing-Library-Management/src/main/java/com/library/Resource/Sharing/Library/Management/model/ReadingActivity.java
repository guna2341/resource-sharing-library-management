package com.library.Resource.Sharing.Library.Management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_activity")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadingActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long activityId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

}


