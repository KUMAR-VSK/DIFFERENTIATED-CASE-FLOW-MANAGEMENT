package com.example.dcm.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.dcm.model.Case;

@Service
public class PriorityEngine {

    // Priority calculation based on case characteristics
    // Higher score = higher priority (1-10 scale)

    public int calculatePriority(Case caseEntity) {
        int basePriority = 5; // Default medium priority

        // Case type weights
        switch (caseEntity.getCaseType()) {
            case CONSTITUTIONAL:
                basePriority += 3; // Highest priority
                break;
            case CRIMINAL:
                basePriority += 2;
                break;
            case FAMILY:
                basePriority += 1;
                break;
            case CIVIL:
                basePriority += 0;
                break;
            case ADMINISTRATIVE:
                basePriority -= 1; // Lower priority
                break;
        }

        // Court level multiplier - higher courts get priority boost
        if (caseEntity.getCourtLevel() != null) {
            switch (caseEntity.getCourtLevel()) {
                case SUPREME:
                    basePriority += 3; // Supreme Court cases get significant boost
                    break;
                case HIGH:
                    basePriority += 2; // High Court cases get moderate boost
                    break;
                case DISTRICT:
                    basePriority += 0; // District Court is baseline
                    break;
            }
        }

        // Resource requirements
        if (caseEntity.getResourceRequirement() != null) {
            String req = caseEntity.getResourceRequirement().toLowerCase();
            if (req.contains("urgent") || req.contains("emergency")) {
                basePriority += 2;
            }
            if (req.contains("special expertise") || req.contains("complex")) {
                basePriority += 1;
            }
        }

        // Estimated duration impact
        if (caseEntity.getEstimatedDurationDays() != null) {
            if (caseEntity.getEstimatedDurationDays() <= 7) {
                basePriority += 1; // Quick resolution cases get slight boost
            } else if (caseEntity.getEstimatedDurationDays() > 90) {
                basePriority -= 1; // Long cases might be deprioritized
            }
        }

        // Escalation boost - cases that have been escalated get priority boost
        if (caseEntity.getEscalationDate() != null) {
            basePriority += 1; // Escalated cases get a boost
        }

        // Ensure priority stays within 1-10 range
        return Math.max(1, Math.min(10, basePriority));
    }

    // Dynamic priority adjustment based on case age and status
    public int adjustPriorityForAge(Case caseEntity) {
        int currentPriority = caseEntity.getPriority();

        // If case is old and still under review, increase priority
        if (caseEntity.getStatus() == Case.Status.UNDER_REVIEW ||
            caseEntity.getStatus() == Case.Status.FILED) {

            long daysSinceFiling = java.time.Duration.between(
                caseEntity.getFilingDate(),
                java.time.LocalDateTime.now()
            ).toDays();

            if (daysSinceFiling > 30) {
                currentPriority = Math.min(10, currentPriority + 1);
            } else if (daysSinceFiling > 90) {
                currentPriority = Math.min(10, currentPriority + 2);
            }
        }

        return currentPriority;
    }

    // Recalculate priorities for all cases when a new case is added
    // This ensures relative priorities remain accurate
    public void recalculateAllPriorities(List<Case> allCases) {
        for (Case caseEntity : allCases) {
            // Skip completed cases as they don't need priority recalculation
            if (caseEntity.getStatus() != Case.Status.COMPLETED) {
                int newPriority = calculatePriority(caseEntity);
                // Apply age-based adjustment for older cases
                newPriority = adjustPriorityForAge(caseEntity);
                caseEntity.setPriority(newPriority);
            }
        }
    }

    // Compare cases for scheduling order
    public int compareCases(Case case1, Case case2) {
        // Higher priority first
        int priorityCompare = Integer.compare(case2.getPriority(), case1.getPriority());
        if (priorityCompare != 0) {
            return priorityCompare;
        }

        // Then by filing date (older first for same priority)
        return case1.getFilingDate().compareTo(case2.getFilingDate());
    }
}
