package com.example.dcm.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {

    List<Case> findByStatus(Case.Status status);

    List<Case> findByCaseType(Case.CaseType caseType);

    List<Case> findByAssignedJudge(User judge);

    List<Case> findByFilingClerk(User clerk);

    boolean existsByCaseNumber(String caseNumber);

    // Priority-based queries for intelligent scheduling
    @Query("SELECT c FROM Case c WHERE c.status IN :statuses ORDER BY c.priority DESC, c.filingDate ASC")
    List<Case> findByStatusOrderByPriorityDescFilingDateAsc(@Param("statuses") List<Case.Status> statuses);

    // Cases requiring scheduling
    @Query("SELECT c FROM Case c WHERE c.status = 'UNDER_REVIEW' AND c.hearingDate IS NULL ORDER BY c.priority DESC")
    List<Case> findUnscheduledCasesOrderByPriority();

    // Cases by priority range
    List<Case> findByPriorityGreaterThanEqual(Integer minPriority);

    // Recent cases
    List<Case> findByFilingDateAfter(LocalDateTime date);

    // Cases assigned to judge with specific status
    List<Case> findByAssignedJudgeAndStatus(User judge, Case.Status status);
}
