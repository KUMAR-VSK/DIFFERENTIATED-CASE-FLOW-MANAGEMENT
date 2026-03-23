package com.example.dcm.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import com.example.dcm.service.CaseService;
import com.example.dcm.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(CaseController.class)
class CaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CaseService caseService;

    @MockBean
    private UserService userService;

    private Case testCase;
    private User testUser;

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

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRole(User.Role.ADMIN);
        testUser.setFirstName("Test");
        testUser.setLastName("User");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllCases_ShouldReturnCases() throws Exception {
        when(caseService.getCasesByPriorityOrder()).thenReturn(List.of(testCase));
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Test Case"));
    }

    @Test
    @WithMockUser(roles = "CLERK")
    void getRecentCases_ShouldReturnRecentCases() throws Exception {
        when(caseService.getRecentCases()).thenReturn(List.of(testCase));
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases/recent"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Test Case"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCaseById_ShouldReturnCase() throws Exception {
        when(caseService.getCaseById(1L)).thenReturn(Optional.of(testCase));

        mockMvc.perform(get("/api/cases/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Test Case"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCaseById_ShouldReturn404_WhenNotFound() throws Exception {
        when(caseService.getCaseById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cases/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CLERK")
    void createCase_ShouldCreateCase() throws Exception {
        Case newCase = new Case();
        newCase.setTitle("New Case");
        newCase.setCaseType(Case.CaseType.CRIMINAL);

        when(caseService.createCase(any(Case.class), anyString())).thenAnswer(invocation -> {
            Case c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        mockMvc.perform(post("/api/cases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCase)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("New Case"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCaseStatus_ShouldUpdateStatus() throws Exception {
        when(caseService.updateCaseStatus(1L, Case.Status.UNDER_REVIEW)).thenReturn(testCase);

        mockMvc.perform(put("/api/cases/1/status")
                .param("status", "UNDER_REVIEW"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignJudge_ShouldAssignJudge() throws Exception {
        User judge = new User();
        judge.setId(2L);
        judge.setRole(User.Role.JUDGE);

        when(caseService.assignJudge(1L, 2L)).thenReturn(testCase);

        mockMvc.perform(put("/api/cases/1/assign-judge")
                .param("judgeId", "2"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCaseStatistics_ShouldReturnStatistics() throws Exception {
        CaseService.CaseStatistics stats = new CaseService.CaseStatistics(10, 5, 3, 2, 5.0);
        when(caseService.getCaseStatistics()).thenReturn(stats);
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases/statistics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalCases").value(10));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getHighPriorityCases_ShouldReturnHighPriorityCases() throws Exception {
        testCase.setPriority(8);
        when(caseService.getHighPriorityCases()).thenReturn(List.of(testCase));
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases/high-priority"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].priority").value(8));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getEscalatedCases_ShouldReturnEscalatedCases() throws Exception {
        testCase.setStatus(Case.Status.ESCALATED);
        when(caseService.getEscalatedCases()).thenReturn(List.of(testCase));

        mockMvc.perform(get("/api/cases/escalated"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").value("ESCALATED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void escalateCase_ShouldEscalateCase() throws Exception {
        testCase.setCourtLevel(Case.CourtLevel.HIGH);
        when(caseService.escalateCase(1L, "Appeal")).thenReturn(testCase);

        mockMvc.perform(post("/api/cases/1/escalate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\": \"Appeal\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.courtLevel").value("HIGH"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deescalateCase_ShouldDeescalateCase() throws Exception {
        testCase.setCourtLevel(Case.CourtLevel.DISTRICT);
        when(caseService.deescalateCase(1L, "Reversal")).thenReturn(testCase);

        mockMvc.perform(post("/api/cases/1/deescalate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\": \"Reversal\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.courtLevel").value("DISTRICT"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDeescalationEligibility_ShouldReturnEligibility() throws Exception {
        CaseService.DeescalationEligibility eligibility = new CaseService.DeescalationEligibility();
        eligibility.setCanDeescalate(true);
        
        when(caseService.getDeescalationEligibility(1L)).thenReturn(eligibility);

        mockMvc.perform(get("/api/cases/1/deescalation-eligibility"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.canDeescalate").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCasesByCourtLevel_ShouldReturnCases() throws Exception {
        when(caseService.getCasesByCourtLevel(Case.CourtLevel.DISTRICT)).thenReturn(List.of(testCase));

        mockMvc.perform(get("/api/cases/court-level/DISTRICT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].courtLevel").value("DISTRICT"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getNextCaseNumber_ShouldReturnNextNumber() throws Exception {
        when(caseService.getNextCaseNumberPreview()).thenReturn("CASE-2026-0001");

        mockMvc.perform(get("/api/cases/next-case-number"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextCaseNumber").value("CASE-2026-0001"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getCourtLevelStats_ShouldReturnStats() throws Exception {
        CaseService.CourtLevelStats stats = new CaseService.CourtLevelStats(5, 3, 2, 2, 1);
        when(caseService.getCourtLevelStats()).thenReturn(stats);
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases/court-stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.districtCourtCases").value(5));
    }

    @Test
    @WithMockUser(roles = "JUDGE")
    void takeOverCase_ShouldTakeOverCase() throws Exception {
        testCase.setAssignedJudge(testUser);
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);
        when(caseService.assignJudge(1L, 1L)).thenReturn(testCase);

        mockMvc.perform(put("/api/cases/1/take-over"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "JUDGE")
    void getUnscheduledCases_ShouldReturnUnscheduledCases() throws Exception {
        when(caseService.getUnscheduledCases()).thenReturn(List.of(testCase));
        when(caseService.getUserByUsername("testuser")).thenReturn(testUser);

        mockMvc.perform(get("/api/cases/unscheduled"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").value("FILED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void canDeescalateCase_ShouldReturnBoolean() throws Exception {
        when(caseService.canDeescalateCase(any(Case.class))).thenReturn(true);
        when(caseService.getCaseById(1L)).thenReturn(Optional.of(testCase));

        mockMvc.perform(get("/api/cases/1/can-deescalate"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.canDeescalate").value(true));
    }
}
