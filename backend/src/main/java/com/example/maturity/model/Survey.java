package com.example.maturity.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "surveys")
public class Survey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "respondent_name", nullable = false)
    private String respondentName;

    @Column(name = "category_scores", columnDefinition = "TEXT", nullable = false)
    private String categoryScores; // Stored as JSON string

    @Column(name = "total_score", nullable = false)
    private Double totalScore;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
