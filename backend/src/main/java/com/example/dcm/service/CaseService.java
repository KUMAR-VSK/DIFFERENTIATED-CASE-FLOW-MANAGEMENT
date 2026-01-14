package com.example.dcm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.UserRepository;

@Service
@Transactional
public class CaseService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PriorityEngine priorityEngine;

    // Create a new case
    public Case createCase(Case caseEntity, String clerkUsername) {
        // Set default status if not provided
        if (caseEntity.getStatus() == null) {
            caseEntity.setStatus(Case.Status.FILED);
        }

        // Set filing clerk
        Optional<User> clerk = userRepository.findByUsername(clerkUsername);
        if (clerk.isPresent()) {
            caseEntity.setFilingClerk(clerk.get());
        }

        // Calculate initial priority
        int calculatedPriority = priorityEngine.calculatePriority(caseEntity);
        caseEntity.setPriority(calculatedPriority);

        Case savedCase = caseRepository.save(caseEntity);

        // Recalculate priorities for all existing cases to maintain relative priority accuracy
        List<Case> allCases = caseRepository.findAll();
        priorityEngine.recalculateAllPriorities(allCases);

        // Save all updated cases
        caseRepository.saveAll(allCases);

        return savedCase;
    }

    // Update case status
    public Case updateCaseStatus(Long caseId, Case.Status newStatus) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setStatus(newStatus);
        return caseRepository.save(caseEntity);
    }

    // Assign judge to case
    public Case assignJudge(Long caseId, Long judgeId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("User is not a judge");
        }

        caseEntity.setAssignedJudge(judge);
        caseEntity.setStatus(Case.Status.SCHEDULED);
        return caseRepository.save(caseEntity);
    }

    // Schedule hearing
    public Case scheduleHearing(Long caseId, LocalDateTime hearingDate) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        if (caseEntity.getAssignedJudge() == null) {
            throw new IllegalArgumentException("Cannot schedule hearing without assigned judge");
        }

        caseEntity.setHearingDate(hearingDate);
        caseEntity.setStatus(Case.Status.SCHEDULED);
        return caseRepository.save(caseEntity);
    }

    // Get cases by priority order (for scheduling)
    public List<Case> getCasesByPriorityOrder() {
        return caseRepository.findByStatusOrderByPriorityDescFilingDateAsc(
            List.of(Case.Status.UNDER_REVIEW, Case.Status.SCHEDULED)
        );
    }

    // Get unscheduled cases
    public List<Case> getUnscheduledCases() {
        return caseRepository.findUnscheduledCasesOrderByPriority();
    }

    // Get cases assigned to judge
    public List<Case> getCasesByJudge(Long judgeId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        return caseRepository.findByAssignedJudge(judge);
    }

    // Get high priority cases
    public List<Case> getHighPriorityCases() {
        return caseRepository.findByPriorityGreaterThanEqual(8);
    }

    // Update case priority
    public Case updatePriority(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Recalculate priority with age consideration
        int newPriority = priorityEngine.adjustPriorityForAge(caseEntity);
        caseEntity.setPriority(newPriority);

        return caseRepository.save(caseEntity);
    }

    // Get case statistics
    public CaseStatistics getCaseStatistics() {
        List<Case> allCases = caseRepository.findAll();

        long totalCases = allCases.size();
        long filedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.FILED ? 1 : 0).sum();
        long scheduledCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.SCHEDULED ? 1 : 0).sum();
        long completedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.COMPLETED ? 1 : 0).sum();

        double avgPriority = allCases.stream().mapToInt(Case::getPriority).average().orElse(0.0);

        return new CaseStatistics(totalCases, filedCases, scheduledCases, completedCases, avgPriority);
    }

    // Get case by ID
    public Optional<Case> getCaseById(Long id) {
        return caseRepository.findById(id);
    }

    // Inner class for statistics
    public static class CaseStatistics {
        private final long totalCases;
        private final long filedCases;
        private final long scheduledCases;
        private final long completedCases;
        private final double averagePriority;

        public CaseStatistics(long totalCases, long filedCases, long scheduledCases, long completedCases, double averagePriority) {
            this.totalCases = totalCases;
            this.filedCases = filedCases;
            this.scheduledCases = scheduledCases;
            this.completedCases = completedCases;
            this.averagePriority = averagePriority;
        }

        // Getters
        public long getTotalCases() { return totalCases; }
        public long getFiledCases() { return filedCases; }
        public long getScheduledCases() { return scheduledCases; }
        public long getCompletedCases() { return completedCases; }
        public double getAveragePriority() { return averagePriority; }
    }
}
