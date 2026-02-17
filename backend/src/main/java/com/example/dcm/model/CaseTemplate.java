package com.example.dcm.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "case_templates")
public class CaseTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type", nullable = false)
    private Case.CaseType caseType;

    @Enumerated(EnumType.STRING)
    @Column(name = "court_level")
    private Case.CourtLevel defaultCourtLevel;

    @Column(name = "default_priority")
    private Integer defaultPriority;

    @Column(name = "estimated_duration_days")
    private Integer estimatedDurationDays;

    @Column(name = "required_documents", length = 5000)
    private String requiredDocuments; // JSON array of required document types

    @Column(name = "checklist_items", length = 5000)
    private String checklistItems; // JSON array of workflow steps

    @Column(name = "mandatory_fields", length = 2000)
    private String mandatoryFields; // JSON array of required form fields

    @Column(name = "workflow_steps", length = 5000)
    private String workflowSteps; // JSON array of process steps

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (defaultCourtLevel == null) {
            defaultCourtLevel = Case.CourtLevel.DISTRICT;
        }
        if (defaultPriority == null) {
            defaultPriority = 5;
        }
    }

    // Constructors
    public CaseTemplate() {}

    public CaseTemplate(String name, String description, Case.CaseType caseType) {
        this.name = name;
        this.description = description;
        this.caseType = caseType;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Case.CaseType getCaseType() { return caseType; }
    public void setCaseType(Case.CaseType caseType) { this.caseType = caseType; }

    public Case.CourtLevel getDefaultCourtLevel() { return defaultCourtLevel; }
    public void setDefaultCourtLevel(Case.CourtLevel defaultCourtLevel) { this.defaultCourtLevel = defaultCourtLevel; }

    public Integer getDefaultPriority() { return defaultPriority; }
    public void setDefaultPriority(Integer defaultPriority) { this.defaultPriority = defaultPriority; }

    public Integer getEstimatedDurationDays() { return estimatedDurationDays; }
    public void setEstimatedDurationDays(Integer estimatedDurationDays) { this.estimatedDurationDays = estimatedDurationDays; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getChecklistItems() { return checklistItems; }
    public void setChecklistItems(String checklistItems) { this.checklistItems = checklistItems; }

    public String getMandatoryFields() { return mandatoryFields; }
    public void setMandatoryFields(String mandatoryFields) { this.mandatoryFields = mandatoryFields; }

    public String getWorkflowSteps() { return workflowSteps; }
    public void setWorkflowSteps(String workflowSteps) { this.workflowSteps = workflowSteps; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
