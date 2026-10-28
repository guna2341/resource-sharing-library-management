package com.library.Resource.Sharing.Library.Management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_badges",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_badge",
                        columnNames = {"user_id", "badge_id"}
                )
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBadges {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userBadgeId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badges badge;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
