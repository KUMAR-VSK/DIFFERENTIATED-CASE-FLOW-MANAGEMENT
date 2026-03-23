package com.example.dcm.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.dcm.model.Case;

class PriorityEngineTest {

    private PriorityEngine priorityEngine;
    private Case testCase;

    @BeforeEach
    void setUp() {
        priorityEngine = new PriorityEngine();
        testCase = new Case();
        testCase.setCaseType(Case.CaseType.CIVIL);
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        testCase.setPriority(5);
        testCase.setFilingDate(LocalDateTime.now());
    }

    @Test
    void calculatePriority_ShouldReturn5_ForCivilCase() {
        testCase.setCaseType(Case.CaseType.CIVIL);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertEquals(5, priority);
    }

    @Test
    void calculatePriority_ShouldReturn7_ForCriminalCase() {
        testCase.setCaseType(Case.CaseType.CRIMINAL);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertEquals(7, priority);
    }

    @Test
    void calculatePriority_ShouldReturn8_ForConstitutionalCase() {
        testCase.setCaseType(Case.CaseType.CONSTITUTIONAL);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertEquals(8, priority);
    }

    @Test
    void calculatePriority_ShouldReturn6_ForFamilyCase() {
        testCase.setCaseType(Case.CaseType.FAMILY);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertEquals(6, priority);
    }

    @Test
    void calculatePriority_ShouldReturn4_ForAdministrativeCase() {
        testCase.setCaseType(Case.CaseType.ADMINISTRATIVE);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertEquals(4, priority);
    }

    @Test
    void calculatePriority_ShouldAddPriorityForSupremeCourt() {
        testCase.setCourtLevel(Case.CourtLevel.SUPREME);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority > 5);
    }

    @Test
    void calculatePriority_ShouldAddPriorityForHighCourt() {
        testCase.setCourtLevel(Case.CourtLevel.HIGH);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority > 5);
    }

    @Test
    void calculatePriority_ShouldBoostForUrgentResource() {
        testCase.setResourceRequirement("Urgent");
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority > 5);
    }

    @Test
    void calculatePriority_ShouldBoostForSpecialExpertise() {
        testCase.setResourceRequirement("Special expertise required");
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority > 5);
    }

    @Test
    void calculatePriority_ShouldBoostForEscalatedCases() {
        testCase.setEscalationDate(LocalDateTime.now());
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority > 5);
    }

    @Test
    void calculatePriority_ShouldCapAt10() {
        testCase.setCaseType(Case.CaseType.CONSTITUTIONAL);
        testCase.setCourtLevel(Case.CourtLevel.SUPREME);
        testCase.setResourceRequirement("Urgent");
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority <= 10);
    }

    @Test
    void calculatePriority_ShouldFloorAt1() {
        testCase.setCaseType(Case.CaseType.ADMINISTRATIVE);
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        
        int priority = priorityEngine.calculatePriority(testCase);
        
        assertTrue(priority >= 1);
    }

    @Test
    void adjustPriorityForAge_ShouldReturnBasePriority_ForNewCase() {
        testCase.setFilingDate(LocalDateTime.now());
        
        int adjusted = priorityEngine.adjustPriorityForAge(testCase);
        
        assertEquals(testCase.getPriority(), adjusted);
    }

    @Test
    void adjustPriorityForAge_ShouldReturnSamePriority_ForCompletedCase() {
        testCase.setStatus(Case.Status.COMPLETED);
        
        int adjusted = priorityEngine.adjustPriorityForAge(testCase);
        
        assertEquals(testCase.getPriority(), adjusted);
    }

    @Test
    void adjustPriorityForAge_ShouldReturnSamePriority_ForDismissedCase() {
        testCase.setStatus(Case.Status.DISMISSED);
        
        int adjusted = priorityEngine.adjustPriorityForAge(testCase);
        
        assertEquals(testCase.getPriority(), adjusted);
    }

    @Test
    void getAgingBoost_ShouldReturn0_ForNewCase() {
        testCase.setFilingDate(LocalDateTime.now());
        
        int boost = priorityEngine.getAgingBoost(testCase);
        
        assertEquals(0, boost);
    }

    @Test
    void getCaseAgeDays_ShouldReturn0_WhenFilingDateIsNull() {
        testCase.setFilingDate(null);
        
        long age = priorityEngine.getCaseAgeDays(testCase);
        
        assertEquals(0, age);
    }

    @Test
    void getCaseAgeDays_ShouldReturnPositive_ForOldCase() {
        testCase.setFilingDate(LocalDateTime.now().minusDays(60));
        
        long age = priorityEngine.getCaseAgeDays(testCase);
        
        assertTrue(age >= 60);
    }

    @Test
    void recalculateAllPriorities_ShouldNotModifyCompletedCases() {
        Case completedCase = new Case();
        completedCase.setStatus(Case.Status.COMPLETED);
        completedCase.setPriority(5);
        
        priorityEngine.recalculateAllPriorities(java.util.List.of(completedCase));
        
        assertEquals(5, completedCase.getPriority());
    }
}
