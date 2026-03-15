package com.example.dcm.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long>, JpaSpecificationExecutor<Case> {

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

    // All cases with eager loading of users to avoid serialization issues
    @Query("SELECT c FROM Case c LEFT JOIN FETCH c.filingClerk LEFT JOIN FETCH c.assignedJudge")
    List<Case> findAllCasesWithUsers();

    // Find the maximum case sequence number for sequential case numbering
    @Query("SELECT MAX(c.caseSequence) FROM Case c")
    Integer findMaxCaseSequence();

    // Get recent cases sorted by filing date (descending)
    @Query("SELECT c FROM Case c ORDER BY c.filingDate DESC")
    List<Case> findTop5ByOrderByFilingDateDesc();

    // Priority-based queries for intelligent scheduling with court level filter
    @Query("SELECT c FROM Case c WHERE c.status IN :statuses AND c.courtLevel = :courtLevel ORDER BY c.priority DESC, c.filingDate ASC")
    List<Case> findByStatusInAndCourtLevelOrderByPriorityDescFilingDateAsc(@Param("statuses") List<Case.Status> statuses, @Param("courtLevel") Case.CourtLevel courtLevel);

    // Get recent cases filtered by court level
    @Query("SELECT c FROM Case c WHERE c.courtLevel = :courtLevel ORDER BY c.filingDate DESC")
    List<Case> findTop5ByCourtLevelOrderByFilingDateDesc(@Param("courtLevel") Case.CourtLevel courtLevel);

    // All cases for a specific court level with eager loading
    @Query("SELECT c FROM Case c LEFT JOIN FETCH c.filingClerk LEFT JOIN FETCH c.assignedJudge WHERE c.courtLevel = :courtLevel")
    List<Case> findAllCasesWithUsersByCourtLevel(@Param("courtLevel") Case.CourtLevel courtLevel);

    // Cases requiring scheduling with court level filter
    @Query("SELECT c FROM Case c WHERE c.status = 'UNDER_REVIEW' AND c.hearingDate IS NULL AND c.courtLevel = :courtLevel ORDER BY c.priority DESC")
    List<Case> findUnscheduledCasesOrderByPriorityAndCourtLevel(@Param("courtLevel") Case.CourtLevel courtLevel);

    // Cases by priority range with court level filter
    List<Case> findByPriorityGreaterThanEqualAndCourtLevel(Integer minPriority, Case.CourtLevel courtLevel);

    // Find all cases with scheduled hearings for calendar view filtered by court level
    @Query("SELECT c FROM Case c WHERE c.hearingDate IS NOT NULL AND c.courtLevel = :courtLevel ORDER BY c.hearingDate ASC")
    List<Case> findAllScheduledHearingsByCourtLevel(@Param("courtLevel") Case.CourtLevel courtLevel);

    // Find cases by court level
    List<Case> findByCourtLevel(Case.CourtLevel courtLevel);

    // Find cases by original case ID (for tracking escalations)
    List<Case> findByOriginalCaseId(Long originalCaseId);

    // Find all cases with scheduled hearings for calendar view
    @Query("SELECT c FROM Case c WHERE c.hearingDate IS NOT NULL ORDER BY c.hearingDate ASC")
    List<Case> findAllScheduledHearings();

    // Find cases assigned to a specific advocate
    List<Case> findByAssignedAdvocate(User advocate);

    // Find cases assigned to advocate with eager loading
    @Query("SELECT c FROM Case c LEFT JOIN FETCH c.filingClerk LEFT JOIN FETCH c.assignedJudge LEFT JOIN FETCH c.assignedAdvocate WHERE c.assignedAdvocate = :advocate")
    List<Case> findByAssignedAdvocateWithUsers(@Param("advocate") User advocate);
}
