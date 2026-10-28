package com.library.Resource.Sharing.Library.Management.model;

import com.library.Resource.Sharing.Library.Management.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(length = 100)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone;

    @Column(name = "profile_url")
    private String profileUrl;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "total_books_stock")
    private Long totalBooksStock = 0L;

    @Column(name = "total_books_uploaded")
    private Long totalBooksUploaded = 0L;

    @Column(name = "total_books_downloaded")
    private Long totalBooksDownloaded = 0L;

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    @Column(name = "reading_streak")
    private Long readingStreak;

    @Column(name = "last_login")
    @CreationTimestamp
    private LocalDateTime lastLogin;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void setDefaultValues() {
        if (isVerified == null) isVerified = false;
        if (role == null) role = UserRole.USER;
        if (totalBooksStock == null) totalBooksStock = 0L;
        if (totalBooksUploaded == null) totalBooksUploaded = 0L;
        if (totalBooksDownloaded == null) totalBooksDownloaded = 0L;
    }

}
