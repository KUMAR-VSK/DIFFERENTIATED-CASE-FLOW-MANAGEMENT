package com.example.dcm.dto;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import java.time.LocalDateTime;

public class CaseDTO {
    private Long id;
    private String caseNumber;
    private Integer caseSequence;
    private String title;
    private String description;
    private Case.CaseType caseType;
    private Case.Status status;
    private Case.CourtLevel courtLevel;
    private Long originalCaseId;
    private String escalationReason;
    private LocalDateTime escalationDate;
    private LocalDateTime filingDate;
    private LocalDateTime hearingDate;
    private Integer priority;
    private Integer estimatedDurationDays;
    private String resourceRequirement;
    private String notes;
    private String documents;
    private Long assignedJudgeId;
    private String assignedJudgeName;
    private Long assignedAdvocateId;
    private String assignedAdvocateName;
    private Long filingClerkId;
    private String filingClerkName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;

    public CaseDTO() {}

    public CaseDTO(Case caseEntity) {
        this.id = caseEntity.getId();
        this.caseNumber = caseEntity.getCaseNumber();
        this.caseSequence = caseEntity.getCaseSequence();
        this.title = caseEntity.getTitle();
        this.description = caseEntity.getDescription();
        this.caseType = caseEntity.getCaseType();
        this.status = caseEntity.getStatus();
        this.courtLevel = caseEntity.getCourtLevel();
        this.originalCaseId = caseEntity.getOriginalCaseId();
        this.escalationReason = caseEntity.getEscalationReason();
        this.escalationDate = caseEntity.getEscalationDate();
        this.filingDate = caseEntity.getFilingDate();
        this.hearingDate = caseEntity.getHearingDate();
        this.priority = caseEntity.getPriority();
        this.estimatedDurationDays = caseEntity.getEstimatedDurationDays();
        this.resourceRequirement = caseEntity.getResourceRequirement();
        this.notes = caseEntity.getNotes();
        this.documents = caseEntity.getDocuments();
        this.createdAt = caseEntity.getCreatedAt();
        this.updatedAt = caseEntity.getUpdatedAt();
        this.isDeleted = caseEntity.isDeleted();

        // Safely extract user information without triggering lazy loading
        if (caseEntity.getAssignedJudge() != null) {
            this.assignedJudgeId = caseEntity.getAssignedJudge().getId();
            this.assignedJudgeName = caseEntity.getAssignedJudge().getFirstName() + " " +
                                   caseEntity.getAssignedJudge().getLastName();
        }
        if (caseEntity.getAssignedAdvocate() != null) {
            this.assignedAdvocateId = caseEntity.getAssignedAdvocate().getId();
            this.assignedAdvocateName = caseEntity.getAssignedAdvocate().getFirstName() + " " +
                                      caseEntity.getAssignedAdvocate().getLastName();
        }
        if (caseEntity.getFilingClerk() != null) {
            this.filingClerkId = caseEntity.getFilingClerk().getId();
            this.filingClerkName = caseEntity.getFilingClerk().getFirstName() + " " +
                                 caseEntity.getFilingClerk().getLastName();
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public Integer getCaseSequence() { return caseSequence; }
    public void setCaseSequence(Integer caseSequence) { this.caseSequence = caseSequence; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Case.CaseType getCaseType() { return caseType; }
    public void setCaseType(Case.CaseType caseType) { this.caseType = caseType; }

    public Case.Status getStatus() { return status; }
    public void setStatus(Case.Status status) { this.status = status; }

    public Case.CourtLevel getCourtLevel() { return courtLevel; }
    public void setCourtLevel(Case.CourtLevel courtLevel) { this.courtLevel = courtLevel; }

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

    public Long getAssignedJudgeId() { return assignedJudgeId; }
    public void setAssignedJudgeId(Long assignedJudgeId) { this.assignedJudgeId = assignedJudgeId; }

    public String getAssignedJudgeName() { return assignedJudgeName; }
    public void setAssignedJudgeName(String assignedJudgeName) { this.assignedJudgeName = assignedJudgeName; }

    public Long getAssignedAdvocateId() { return assignedAdvocateId; }
    public void setAssignedAdvocateId(Long assignedAdvocateId) { this.assignedAdvocateId = assignedAdvocateId; }

    public String getAssignedAdvocateName() { return assignedAdvocateName; }
    public void setAssignedAdvocateName(String assignedAdvocateName) { this.assignedAdvocateName = assignedAdvocateName; }

    public Long getFilingClerkId() { return filingClerkId; }
    public void setFilingClerkId(Long filingClerkId) { this.filingClerkId = filingClerkId; }

    public String getFilingClerkName() { return filingClerkName; }
    public void setFilingClerkName(String filingClerkName) { this.filingClerkName = filingClerkName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { this.isDeleted = deleted; }
}