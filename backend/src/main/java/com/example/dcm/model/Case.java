package com.example.dcm.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "cases")
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", unique = true, nullable = false)
    private String caseNumber;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseType caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "filing_date", nullable = false)
    private LocalDateTime filingDate;

    @Column(name = "hearing_date")
    private LocalDateTime hearingDate;

    @Column(nullable = false)
    private Integer priority; // 1-10, higher number = higher priority

    @Column(name = "estimated_duration_days")
    private Integer estimatedDurationDays;

    @Column(name = "resource_requirement")
    private String resourceRequirement; // e.g., "High court resources", "Special expertise needed"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_judge_id")
    private User assignedJudge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filing_clerk_id")
    private User filingClerk;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (filingDate == null) {
            filingDate = LocalDateTime.now();
        }

        // Auto-generate case number if not provided
        if (caseNumber == null || caseNumber.trim().isEmpty()) {
            caseNumber = generateCaseNumber();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Generate unique case number in format: CASE-YYYY-NNNN
    private String generateCaseNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        // For simplicity, we'll use a random 4-digit number
        // In a production system, you might want to use a sequence or database counter
        int sequence = (int) (Math.random() * 9000) + 1000; // 1000-9999
        return String.format("CASE-%s-%04d", year, sequence);
    }

    public enum CaseType {
        CIVIL, CRIMINAL, FAMILY, ADMINISTRATIVE, CONSTITUTIONAL
    }

    public enum Status {
        FILED, UNDER_REVIEW, SCHEDULED, IN_PROGRESS, COMPLETED, DISMISSED
    }

    // Constructors
    public Case() {}

    public Case(String caseNumber, String title, String description, CaseType caseType) {
        this.caseNumber = caseNumber;
        this.title = title;
        this.description = description;
        this.caseType = caseType;
        this.status = Status.FILED;
        this.priority = 5; // Default medium priority
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public CaseType getCaseType() { return caseType; }
    public void setCaseType(CaseType caseType) { this.caseType = caseType; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDateTime filingDate) { this.filingDate = filingDate; }

    public LocalDateTime getHearingDate() { return hearingDate; }
    public void setHearingDate(LocalDateTime hearingDate) { this.hearingDate = hearingDate; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getEstimatedDurationDays() { return estimatedDurationDays; }
    public void setEstimatedDurationDays(Integer estimatedDurationDays) { this.estimatedDurationDays = estimatedDurationDays; }

    public String getResourceRequirement() { return resourceRequirement; }
    public void setResourceRequirement(String resourceRequirement) { this.resourceRequirement = resourceRequirement; }

    public User getAssignedJudge() { return assignedJudge; }
    public void setAssignedJudge(User assignedJudge) { this.assignedJudge = assignedJudge; }

    public User getFilingClerk() { return filingClerk; }
    public void setFilingClerk(User filingClerk) { this.filingClerk = filingClerk; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
