package com.library.Resource.Sharing.Library.Management.model;

import com.library.Resource.Sharing.Library.Management.enums.FileType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "documents")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_id")
    private Long bookId;

    @Column(name = "root_book_id")
    private Long rootBookId;

    @Column(length = 255)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "tags", length = 500)
    private String tags;

    private Integer version;

    private Integer pages;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "file_url", columnDefinition = "TEXT")
    @NotBlank(message = "File url is required")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type")
    private FileType fileType;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "is_current")
    private Boolean isCurrent;

    @JoinColumn(name = "uploaded_by", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private User uploadedBy;

    @JoinColumn(name = "author_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Author author;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void setDefault() {
        if (version == null) version = 1;
        if (averageRating == null) averageRating = 0.0;
        if (isCurrent == null) isCurrent = false;
    }

}
