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
import jakarta.persistence.Table;

@Entity
@Table(name = "case_audit")
public class CaseAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Column(name = "case_number", nullable = false)
    private String caseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActionType actionType;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private Case.Status previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private Case.Status newStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_court_level")
    private Case.CourtLevel previousCourtLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_court_level")
    private Case.CourtLevel newCourtLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    @Column(length = 2000)
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum ActionType {
        CASE_CREATED,
        STATUS_CHANGED,
        JUDGE_ASSIGNED,
        HEARING_SCHEDULED,
        PRIORITY_UPDATED,
        NOTE_ADDED,
        NOTE_UPDATED,
        DOCUMENT_UPLOADED,
        DOCUMENT_DELETED,
        COURT_ESCALATED,
        CASE_DISMISSED,
        CASE_COMPLETED,
        CASE_REOPENED,
        APPEAL_FILED,
        JUDGMENT_RENDERED,
        OTHER
    }

    // Constructors
    public CaseAudit() {}

    public CaseAudit(Case caseEntity, ActionType actionType, String description) {
        this.caseEntity = caseEntity;
        this.caseNumber = caseEntity.getCaseNumber();
        this.actionType = actionType;
        this.description = description;
    }

    // Static factory methods for common audit actions
    public static CaseAudit createCaseCreatedAudit(Case caseEntity, User createdBy) {
        CaseAudit audit = new CaseAudit(caseEntity, ActionType.CASE_CREATED,
                "Case filed in " + caseEntity.getCourtLevel().getDisplayName());
        audit.setPerformedBy(createdBy);
        return audit;
    }

    public static CaseAudit createStatusChangedAudit(Case caseEntity, Case.Status previousStatus,
            Case.Status newStatus, User performedBy) {
        CaseAudit audit = new CaseAudit(caseEntity, ActionType.STATUS_CHANGED,
                "Status changed from " + previousStatus + " to " + newStatus);
        audit.setPreviousStatus(previousStatus);
        audit.setNewStatus(newStatus);
        audit.setPerformedBy(performedBy);
        return audit;
    }

    public static CaseAudit createEscalationAudit(Case caseEntity, Case.CourtLevel previousLevel,
            Case.CourtLevel newLevel, String reason, User performedBy) {
        CaseAudit audit = new CaseAudit(caseEntity, ActionType.COURT_ESCALATED,
                "Case escalated from " + previousLevel.getDisplayName() + " to " + newLevel.getDisplayName());
        audit.setPreviousCourtLevel(previousLevel);
        audit.setNewCourtLevel(newLevel);
        audit.setDetails("Escalation reason: " + reason);
        audit.setPerformedBy(performedBy);
        return audit;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Case getCaseEntity() { return caseEntity; }
    public void setCaseEntity(Case caseEntity) { this.caseEntity = caseEntity; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Case.Status getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(Case.Status previousStatus) { this.previousStatus = previousStatus; }

    public Case.Status getNewStatus() { return newStatus; }
    public void setNewStatus(Case.Status newStatus) { this.newStatus = newStatus; }

    public Case.CourtLevel getPreviousCourtLevel() { return previousCourtLevel; }
    public void setPreviousCourtLevel(Case.CourtLevel previousCourtLevel) { this.previousCourtLevel = previousCourtLevel; }

    public Case.CourtLevel getNewCourtLevel() { return newCourtLevel; }
    public void setNewCourtLevel(Case.CourtLevel newCourtLevel) { this.newCourtLevel = newCourtLevel; }

    public User getPerformedBy() { return performedBy; }
    public void setPerformedBy(User performedBy) { this.performedBy = performedBy; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
