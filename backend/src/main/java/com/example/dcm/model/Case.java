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
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "court_cases", indexes = {
    @Index(name = "idx_case_number", columnList = "case_number"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_case_type", columnList = "case_type"),
    @Index(name = "idx_court_level", columnList = "court_level"),
    @Index(name = "idx_priority", columnList = "priority"),
    @Index(name = "idx_filing_date", columnList = "filing_date"),
    @Index(name = "idx_hearing_date", columnList = "hearing_date"),
    @Index(name = "idx_assigned_judge", columnList = "assigned_judge_id"),
    @Index(name = "idx_status_priority", columnList = "status, priority"),
    @Index(name = "idx_court_status", columnList = "court_level, status"),
    @Index(name = "idx_is_deleted", columnList = "is_deleted")
})
@SQLDelete(sql = "UPDATE court_cases SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", unique = true, nullable = false)
    private String caseNumber;

    @Column(name = "case_sequence", unique = true, nullable = false)
    private Integer caseSequence;

    @Column(nullable = false)
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @Column(length = 2000)
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type", nullable = false)
    @NotNull(message = "Case type is required")
    private CaseType caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "court_level", nullable = false)
    private CourtLevel courtLevel;

    @Column(name = "original_case_id")
    private Long originalCaseId; // For escalated cases, points to original

    @Column(name = "escalation_reason")
    private String escalationReason;

    @Column(name = "escalation_date")
    private LocalDateTime escalationDate;

    @Column(name = "filing_date", nullable = false)
    private LocalDateTime filingDate;

    @Column(name = "hearing_date")
    private LocalDateTime hearingDate;

    @Column(nullable = false)
    @Min(value = 1, message = "Priority must be between 1 and 10")
    @Max(value = 10, message = "Priority must be between 1 and 10")
    private Integer priority; // 1-10, higher number = higher priority

    @Column(name = "estimated_duration_days")
    private Integer estimatedDurationDays;

    @Column(name = "resource_requirement")
    private String resourceRequirement; // e.g., "High court resources", "Special expertise needed"

    @Column(length = 5000)
    private String notes; // Case notes and comments

    @Column(length = 10000)
    private String documents; // JSON string containing document metadata

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_judge_id")
    private User assignedJudge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_advocate_id")
    private User assignedAdvocate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filing_clerk_id")
    private User filingClerk;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (filingDate == null) {
            filingDate = LocalDateTime.now();
        }

        // Auto-generate case number if not provided
        if (caseNumber == null || caseNumber.trim().isEmpty()) {
            caseNumber = generateSequentialCaseNumber();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    // Generate sequential case number starting from 1 with court level suffix
    private String generateSequentialCaseNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String baseNumber = String.format("CASE-%s-%04d", year, caseSequence);

        // Add court level suffix for escalated cases
        if (courtLevel != null && courtLevel != CourtLevel.DISTRICT) {
            String suffix = switch (courtLevel) {
                case HIGH -> "-HC";
                case SUPREME -> "-SC";
                default -> "";
            };
            baseNumber += suffix;
        }

        return baseNumber;
    }

    public enum CaseType {
        CIVIL, CRIMINAL, FAMILY, ADMINISTRATIVE, CONSTITUTIONAL
    }

    public enum Status {
        FILED, UNDER_REVIEW, SCHEDULED, IN_PROGRESS, COMPLETED, DISMISSED, ESCALATED
    }

    public enum CourtLevel {
        DISTRICT("District Court"),
        HIGH("High Court"),
        SUPREME("Supreme Court");

        private final String displayName;

        CourtLevel(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }

        // Get next court level for escalation
        public CourtLevel getNextLevel() {
            return switch (this) {
                case DISTRICT -> HIGH;
                case HIGH -> SUPREME;
                case SUPREME -> null; // Supreme Court is final level
            };
        }

        // Check if this is the final court level
        public boolean isFinalLevel() {
            return this == SUPREME;
        }

        // Get previous court level for de-escalation
        public CourtLevel getPreviousLevel() {
            return switch (this) {
                case SUPREME -> HIGH;
                case HIGH -> DISTRICT;
                case DISTRICT -> null; // District is lowest level
            };
        }
    }

    // Constructors
    public Case() {}

    public Case(String caseNumber, String title, String description, CaseType caseType) {
        this.caseNumber = caseNumber;
        this.title = title;
        this.description = description;
        this.caseType = caseType;
        this.status = Status.FILED;
        this.courtLevel = CourtLevel.DISTRICT; // All new cases start in District Court
        this.priority = 5; // Default medium priority
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCaseSequence() { return caseSequence; }
    public void setCaseSequence(Integer caseSequence) { this.caseSequence = caseSequence; }

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

    public CourtLevel getCourtLevel() { return courtLevel; }
    public void setCourtLevel(CourtLevel courtLevel) { this.courtLevel = courtLevel; }

    public Long getOriginalCaseId() { return originalCaseId; }
    public void setOriginalCaseId(Long originalCaseId) { this.originalCaseId = originalCaseId; }

    public String getEscalationReason() { return escalationReason; }
    public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }

    public LocalDateTime getEscalationDate() { return escalationDate; }
    public void setEscalationDate(LocalDateTime escalationDate) { this.escalationDate = escalationDate; }

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

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDocuments() { return documents; }
    public void setDocuments(String documents) { this.documents = documents; }

    public User getAssignedJudge() { return assignedJudge; }
    public void setAssignedJudge(User assignedJudge) { this.assignedJudge = assignedJudge; }

    public User getAssignedAdvocate() { return assignedAdvocate; }
    public void setAssignedAdvocate(User assignedAdvocate) { this.assignedAdvocate = assignedAdvocate; }

    public User getFilingClerk() { return filingClerk; }
    public void setFilingClerk(User filingClerk) { this.filingClerk = filingClerk; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
}
