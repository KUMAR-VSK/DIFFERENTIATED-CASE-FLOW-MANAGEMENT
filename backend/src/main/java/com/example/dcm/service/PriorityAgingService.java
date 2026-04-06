package com.example.dcm.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dcm.model.Case;
import com.example.dcm.repository.CaseRepository;

@Service
@Transactional
public class PriorityAgingService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private PriorityEngine priorityEngine;

    /**
     * Automatically age priorities of all active cases every day at midnight.
     * For demonstration, this can be run more frequently if needed.
     */
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    public void runPriorityAging() {
        System.out.println("Running automated priority aging task...");
        List<Case> activeCases = caseRepository.findAll(); // In a real app, filter for active cases
        
        int updatedCount = 0;
        for (Case caseEntity : activeCases) {
            if (caseEntity.getStatus() != Case.Status.COMPLETED && 
                caseEntity.getStatus() != Case.Status.DISMISSED) {
                
                int oldPriority = caseEntity.getPriority();
                int newPriority = priorityEngine.adjustPriorityForAge(caseEntity);
                
                if (oldPriority != newPriority) {
                    caseEntity.setPriority(newPriority);
                    caseRepository.save(caseEntity);
                    updatedCount++;
                }
            }
        }
        System.out.println("Priority aging complete. Updated " + updatedCount + " cases.");
    }

    /**
     * Run every hour for demonstration purposes to ensure priorities are fresh.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void hourlyPriorityRefresh() {
        runPriorityAging();
    }
}
