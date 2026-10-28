package com.library.Resource.Sharing.Library.Management.model;

import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_points")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userPointId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = false)
    private Badges badge;

    private Long points;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
