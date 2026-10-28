package com.library.Resource.Sharing.Library.Management.model;

import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badges {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    private String name;

    private String description;

    @Column(nullable = false)
    private String iconUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "requirement_type")
    private BadgeRequirementType requirementType;

    @Column(nullable = false, name = "requirement_value")
    private Integer requirementValue;

    private Boolean active;

    @Min(value = 0, message = "points must be greater than 0")
    private Long points;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void updateDefault() {
        if (active == null) {
            this.active = false;
        }
    }

}
