package com.library.Resource.Sharing.Library.Management.model;

import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMembers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long communityMemberId;

    @ManyToOne
    @JoinColumn(name = "community_id", nullable = false)
    private Communities communities;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    private CommunitymemberRole role;

}
