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

    @Column(length = 100)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(length = 255)
    private String description;

    private Integer version;

    private Integer pages;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "file_url")
    @NotBlank(message = "File url is required")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type")
    private FileType fileType;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "is_current")
    private Boolean isCurrent;

    @JoinColumn(name = "uploaded_by")
    @ManyToOne(fetch = FetchType.LAZY)
    private User uploadedBy;

    @JoinColumn(name = "author_id")
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
