package com.example.dcm.dto;

import com.example.dcm.model.Case;
import java.time.LocalDate;
import java.util.List;

public class CaseSearchCriteria {
    
    private String keyword;
    private List<Case.CaseType> caseTypes;
    private List<Case.Status> statuses;
    private List<Case.CourtLevel> courtLevels;
    private LocalDate filingDateFrom;
    private LocalDate filingDateTo;
    private Integer minPriority;
    private Integer maxPriority;
    private Long assignedJudgeId;
    private String caseNumber;
    
    // Constructors
    public CaseSearchCriteria() {}
    
    // Getters and Setters
    public String getKeyword() {
        return keyword;
    }
    
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
    
    public List<Case.CaseType> getCaseTypes() {
        return caseTypes;
    }
    
    public void setCaseTypes(List<Case.CaseType> caseTypes) {
        this.caseTypes = caseTypes;
    }
    
    public List<Case.Status> getStatuses() {
        return statuses;
    }
    
    public void setStatuses(List<Case.Status> statuses) {
        this.statuses = statuses;
    }
    
    public List<Case.CourtLevel> getCourtLevels() {
        return courtLevels;
    }
    
    public void setCourtLevels(List<Case.CourtLevel> courtLevels) {
        this.courtLevels = courtLevels;
    }
    
    public LocalDate getFilingDateFrom() {
        return filingDateFrom;
    }
    
    public void setFilingDateFrom(LocalDate filingDateFrom) {
        this.filingDateFrom = filingDateFrom;
    }
    
    public LocalDate getFilingDateTo() {
        return filingDateTo;
    }
    
    public void setFilingDateTo(LocalDate filingDateTo) {
        this.filingDateTo = filingDateTo;
    }
    
    public Integer getMinPriority() {
        return minPriority;
    }
    
    public void setMinPriority(Integer minPriority) {
        this.minPriority = minPriority;
    }
    
    public Integer getMaxPriority() {
        return maxPriority;
    }
    
    public void setMaxPriority(Integer maxPriority) {
        this.maxPriority = maxPriority;
    }
    
    public Long getAssignedJudgeId() {
        return assignedJudgeId;
    }
    
    public void setAssignedJudgeId(Long assignedJudgeId) {
        this.assignedJudgeId = assignedJudgeId;
    }
    
    public String getCaseNumber() {
        return caseNumber;
    }
    
    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }
}
