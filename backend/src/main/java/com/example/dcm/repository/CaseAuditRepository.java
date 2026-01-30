package com.example.dcm.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseAudit;
import com.example.dcm.model.User;

@Repository
public interface CaseAuditRepository extends JpaRepository<CaseAudit, Long> {

    // Find all audit entries for a case
    List<CaseAudit> findByCaseEntity(Case caseEntity);

    // Find all audit entries for a case ordered by date (newest first)
    List<CaseAudit> findByCaseEntityOrderByCreatedAtDesc(Case caseEntity);

    // Find audit entries by case ID
    List<CaseAudit> findByCaseEntityId(Long caseId);

    // Find audit entries by action type
    List<CaseAudit> findByCaseEntityAndActionType(Case caseEntity, CaseAudit.ActionType actionType);

    // Find audit entries performed by a specific user
    List<CaseAudit> findByPerformedBy(User user);

    // Find audit entries within a date range
    List<CaseAudit> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find audit entries by case number
    List<CaseAudit> findByCaseNumber(String caseNumber);

    // Count audit entries for a case
    long countByCaseEntity(Case caseEntity);

    // Delete all audit entries for a case
    void deleteByCaseEntity(Case caseEntity);
}
