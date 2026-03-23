package com.example.dcm.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseAuditRepository;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CaseServiceTest {

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CaseAuditRepository caseAuditRepository;

    @Mock
    private PriorityEngine priorityEngine;

    @InjectMocks
    private CaseService caseService;

    private Case testCase;
    private User testClerk;
    private User testJudge;

    @BeforeEach
    void setUp() {
        testCase = new Case();
        testCase.setId(1L);
        testCase.setTitle("Test Case");
        testCase.setCaseType(Case.CaseType.CIVIL);
        testCase.setStatus(Case.Status.FILED);
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        testCase.setPriority(5);
        testCase.setFilingDate(LocalDateTime.now());

        testClerk = new User();
        testClerk.setId(1L);
        testClerk.setUsername("clerk1");
        testClerk.setRole(User.Role.CLERK);
        testClerk.setFirstName("John");
        testClerk.setLastName("Doe");

        testJudge = new User();
        testJudge.setId(2L);
        testJudge.setUsername("judge1");
        testJudge.setRole(User.Role.JUDGE);
        testJudge.setFirstName("Jane");
        testJudge.setLastName("Smith");
        testJudge.setCourtLevel(User.CourtLevel.DISTRICT);
    }

    @Test
    void createCase_ShouldSetDefaultStatus() {
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(testClerk));
        when(priorityEngine.calculatePriority(any(Case.class))).thenReturn(5);
        when(caseRepository.findMaxCaseSequence()).thenReturn(0);
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> {
            Case c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(caseRepository.findAll()).thenReturn(new ArrayList<>());
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.createCase(testCase, "clerk1");

        assertEquals(Case.Status.FILED, result.getStatus());
    }

    @Test
    void createCase_ShouldSetDefaultCourtLevel() {
        testCase.setCourtLevel(null);
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(testClerk));
        when(priorityEngine.calculatePriority(any(Case.class))).thenReturn(5);
        when(caseRepository.findMaxCaseSequence()).thenReturn(0);
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> {
            Case c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(caseRepository.findAll()).thenReturn(new ArrayList<>());
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.createCase(testCase, "clerk1");

        assertEquals(Case.CourtLevel.DISTRICT, result.getCourtLevel());
    }

    @Test
    void createCase_ShouldCalculatePriority() {
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(testClerk));
        when(priorityEngine.calculatePriority(any(Case.class))).thenReturn(7);
        when(caseRepository.findMaxCaseSequence()).thenReturn(0);
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> {
            Case c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(caseRepository.findAll()).thenReturn(new ArrayList<>());
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.createCase(testCase, "clerk1");

        assertEquals(7, result.getPriority());
    }

    @Test
    void createCase_ShouldGenerateCaseNumber() {
        when(userRepository.findByUsername("clerk1")).thenReturn(Optional.of(testClerk));
        when(priorityEngine.calculatePriority(any(Case.class))).thenReturn(5);
        when(caseRepository.findMaxCaseSequence()).thenReturn(5);
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> {
            Case c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(caseRepository.findAll()).thenReturn(new ArrayList<>());
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.createCase(testCase, "clerk1");

        assertNotNull(result.getCaseNumber());
        assertTrue(result.getCaseNumber().startsWith("CASE-"));
    }

    @Test
    void updateCaseStatus_ShouldChangeStatus() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.updateCaseStatus(1L, Case.Status.UNDER_REVIEW);

        assertEquals(Case.Status.UNDER_REVIEW, result.getStatus());
    }

    @Test
    void updateCaseStatus_ShouldThrowException_WhenCaseNotFound() {
        when(caseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            caseService.updateCaseStatus(999L, Case.Status.UNDER_REVIEW));
    }

    @Test
    void assignJudge_ShouldAssignJudge() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testJudge));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(caseAuditRepository.save(any())).thenReturn(null);

        Case result = caseService.assignJudge(1L, 2L);

        assertEquals(testJudge, result.getAssignedJudge());
        assertEquals(Case.Status.SCHEDULED, result.getStatus());
    }

    @Test
    void assignJudge_ShouldThrowException_WhenJudgeNotFound() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            caseService.assignJudge(1L, 999L));
    }

    @Test
    void assignJudge_ShouldThrowException_WhenUserNotJudge() {
        testClerk.setRole(User.Role.CLERK);
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testClerk));

        assertThrows(IllegalArgumentException.class, () -> 
            caseService.assignJudge(1L, 1L));
    }

    @Test
    void escalateCase_ShouldEscalateToNextLevel() {
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        testCase.setStatus(Case.Status.UNDER_REVIEW);
        
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(caseRepository.findMaxCaseSequence()).thenReturn(0);

        Case result = caseService.escalateCase(1L, "Appeal filed");

        assertEquals(Case.CourtLevel.HIGH, result.getCourtLevel());
        assertEquals(Case.Status.ESCALATED, result.getStatus());
        assertEquals("Appeal filed", result.getEscalationReason());
    }

    @Test
    void escalateCase_ShouldThrowException_WhenAlreadyAtSupremeCourt() {
        testCase.setCourtLevel(Case.CourtLevel.SUPREME);
        
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));

        assertThrows(IllegalStateException.class, () -> 
            caseService.escalateCase(1L, "Appeal"));
    }

    @Test
    void deescalateCase_ShouldDeescalateToLowerLevel() {
        testCase.setCourtLevel(Case.CourtLevel.HIGH);
        testCase.setStatus(Case.Status.ESCALATED);
        
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(caseRepository.findMaxCaseSequence()).thenReturn(0);

        Case result = caseService.deescalateCase(1L, "Reversal on appeal");

        assertEquals(Case.CourtLevel.DISTRICT, result.getCourtLevel());
        assertNotNull(result.getEscalationReason());
    }

    @Test
    void deescalateCase_ShouldThrowException_WhenAlreadyAtDistrict() {
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));

        assertThrows(IllegalStateException.class, () -> 
            caseService.deescalateCase(1L, "Reason"));
    }

    @Test
    void canDeescalateCase_ShouldReturnTrue_WhenNotAtDistrict() {
        testCase.setCourtLevel(Case.CourtLevel.HIGH);

        assertTrue(caseService.canDeescalateCase(testCase));
    }

    @Test
    void canDeescalateCase_ShouldReturnFalse_WhenAtDistrict() {
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);

        assertFalse(caseService.canDeescalateCase(testCase));
    }

    @Test
    void getCaseStatistics_ShouldCalculateStatistics() {
        List<Case> cases = List.of(testCase);
        when(caseRepository.findAll()).thenReturn(cases);

        CaseService.CaseStatistics stats = caseService.getCaseStatistics();

        assertEquals(1, stats.getTotalCases());
        assertEquals(1, stats.getFiledCases());
    }

    @Test
    void getHighPriorityCases_ShouldReturnHighPriorityCases() {
        testCase.setPriority(8);
        when(caseRepository.findByPriorityGreaterThanEqual(8)).thenReturn(List.of(testCase));

        List<Case> result = caseService.getHighPriorityCases();

        assertEquals(1, result.size());
        assertEquals(8, result.get(0).getPriority());
    }

    @Test
    void getCasesByPriorityOrder_ShouldReturnCases() {
        when(caseRepository.findByStatusOrderByPriorityDescFilingDateAsc(any()))
            .thenReturn(List.of(testCase));

        List<Case> result = caseService.getCasesByPriorityOrder();

        assertFalse(result.isEmpty());
    }

    @Test
    void updatePriority_ShouldRecalculatePriority() {
        testCase.setPriority(5);
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(priorityEngine.adjustPriorityForAge(any(Case.class))).thenReturn(6);
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Case result = caseService.updatePriority(1L);

        assertNotNull(result);
    }

    @Test
    void getPreviousCourtLevel_ShouldReturnCorrectLevel() {
        assertEquals(Case.CourtLevel.HIGH, caseService.getPreviousCourtLevel(Case.CourtLevel.SUPREME));
        assertEquals(Case.CourtLevel.DISTRICT, caseService.getPreviousCourtLevel(Case.CourtLevel.HIGH));
        assertNull(caseService.getPreviousCourtLevel(Case.CourtLevel.DISTRICT));
    }

    @Test
    void getCaseById_ShouldReturnCase() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));

        Optional<Case> result = caseService.getCaseById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Case", result.get().getTitle());
    }

    @Test
    void getCaseById_ShouldReturnEmpty_WhenNotFound() {
        when(caseRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Case> result = caseService.getCaseById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void setManualPriority_ShouldSetPriority() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Case result = caseService.setManualPriority(1L, 9);

        assertEquals(9, result.getPriority());
    }

    @Test
    void updateCaseNotes_ShouldUpdateNotes() {
        when(caseRepository.findById(1L)).thenReturn(Optional.of(testCase));
        when(caseRepository.save(any(Case.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Case result = caseService.updateCaseNotes(1L, "New notes");

        assertEquals("New notes", result.getNotes());
    }
}
