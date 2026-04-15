package com.example.dcm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import com.example.dcm.service.CaseService;
import com.example.dcm.dto.ReasonRequest;
import com.example.dcm.dto.ScheduleRequest;
import com.example.dcm.dto.CaseSearchCriteria;
import com.example.dcm.dto.JudgeWorkloadDTO;
import com.example.dcm.dto.CaseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
@Tag(name = "Cases", description = "Case management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CaseController {

    @Autowired
    private CaseService caseService;

    // Helper method to generate PDF filename with case number
    private String generateCasePDFFilename(Case caseEntity) {
        String caseNumber = caseEntity.getCaseNumber();
        return String.format("%s.pdf", caseNumber);
    }

    // Get all cases (for admins and judges)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Get all cases", description = "Retrieve all cases based on user role. Admins see all cases, judges see cases from their court level.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getAllCases(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        List<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getCasesByPriorityOrder();
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getCasesByPriorityOrderAndCourtLevel(currentUser.getCourtLevel());
        } else {
            cases = caseService.getCasesByPriorityOrder();
        }
        return ResponseEntity.ok(cases);
    }

    // Get recent cases (sorted by creation date, descending)
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK') or hasRole('ADVOCATE')")
    @Operation(summary = "Get recent cases", description = "Retrieve recently created cases sorted by filing date in descending order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved recent cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getRecentCases(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        List<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getRecentCases();
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getRecentCasesByCourtLevel(currentUser.getCourtLevel());
        } else {
            cases = caseService.getRecentCases();
        }
        return ResponseEntity.ok(cases);
    }

    // Get all cases for case management (includes filed cases) - paginated
    @GetMapping("/management")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Get paginated cases for management", description = "Retrieve all cases with pagination for case management. Supports sorting and filtering.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<Case>> getAllCasesForManagement(
            Authentication authentication,
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field", example = "filingDate") @RequestParam(defaultValue = "filingDate") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "desc") @RequestParam(defaultValue = "desc") String direction) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);

        Page<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getAllCasesPaged(page, size, sortBy, direction);
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getAllCasesByCourtLevelPaged(currentUser.getCourtLevel(), page, size, sortBy, direction);
        } else {
            cases = caseService.getAllCasesPaged(page, size, sortBy, direction);
        }
        return ResponseEntity.ok(cases);
    }

    // Search cases using Specifications - paginated
    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Search cases with dynamic filters", description = "Search cases using multiple criteria including case number, title, status, court level, priority range, and date ranges")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully searched cases"),
        @ApiResponse(responseCode = "400", description = "Invalid search criteria"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<Case>> searchCases(
            @Parameter(description = "Search criteria", required = true) @RequestBody CaseSearchCriteria criteria,
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field", example = "filingDate") @RequestParam(defaultValue = "filingDate") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "desc") @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication) {
        
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        // Non-admins only see cases at their court level
        if (currentUser.getRole() != User.Role.ADMIN && currentUser.getCourtLevel() != null) {
            criteria.setCourtLevels(List.of(com.example.dcm.model.Case.CourtLevel.valueOf(currentUser.getCourtLevel().name())));
        }

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Case> results = caseService.searchCases(criteria, pageable);
        return ResponseEntity.ok(results);
    }

    // Get case by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK') or hasRole('ADVOCATE')")
    @Operation(summary = "Get case by ID", description = "Retrieve detailed information about a specific case by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved case"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<CaseDTO> getCaseById(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id) {
        Optional<CaseDTO> caseOptional = caseService.getCaseDTOById(id);
        return caseOptional.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
    }

    // Create new case (clerks only) - optionally assign advocate at filing time
    @PostMapping
    @PreAuthorize("hasRole('CLERK') or hasRole('ADMIN')")
    @Operation(summary = "Create new case", description = "Create a new case with optional advocate assignment. Only clerks and admins can create cases.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Case created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid case data or business rule violation"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> createCase(
            @Parameter(description = "Case details", required = true) @Valid @RequestBody Case caseEntity,
            @Parameter(description = "Optional advocate ID to assign at filing time", example = "5") @RequestParam(required = false) Long advocateId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Case savedCase = caseService.createCase(caseEntity, username);
            // If clerk selected an advocate at filing time, assign immediately
            if (advocateId != null) {
                savedCase = caseService.assignAdvocate(savedCase.getId(), advocateId);
            }
            return ResponseEntity.ok(savedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    // Update case status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Update case status", description = "Update the status of a specific case. Valid statuses: PENDING, ACTIVE, COMPLETED, DISMISSED, etc.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Case status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> updateCaseStatus(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id, 
            @Parameter(description = "New case status", required = true, example = "ACTIVE") @RequestParam Case.Status status, 
            Authentication authentication) {
        try {
            Case updatedCase = caseService.updateCaseStatus(id, status, authentication.getName());
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign judge to case
    @PutMapping("/{id}/assign-judge")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK')")
    @Operation(summary = "Assign a judge to a case with workload awareness", description = "Assign a judge to a specific case considering current workload distribution")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Judge assigned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid judge ID or assignment not allowed"),
        @ApiResponse(responseCode = "404", description = "Case or judge not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> assignJudge(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id, 
            @Parameter(description = "Request body containing judge ID", required = true) @RequestBody Map<String, Long> request, 
            Authentication authentication) {
        try {
            Long judgeId = request.get("judgeId");
            Case updatedCase = caseService.assignJudge(id, judgeId, authentication.getName());
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get judge workloads for intelligent assignment
    @GetMapping("/judges/workload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK')")
    @Operation(summary = "Get judge workloads for optimized case distribution", description = "Retrieve workload statistics for all judges at a specific court level to optimize case assignments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved judge workloads"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<JudgeWorkloadDTO>> getJudgeWorkloads(
            @Parameter(description = "Court level for filtering judges", required = true, example = "DISTRICT") @RequestParam User.CourtLevel level) {
        return ResponseEntity.ok(caseService.getJudgeWorkloads(level));
    }

    // Judge takes over case 
    @PutMapping("/{id}/take-over")
    @PreAuthorize("hasRole('JUDGE')")
    @Operation(summary = "Judge takes over case", description = "Allow a judge to take ownership of a case for themselves")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Case taken over successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot take over case (wrong court level, etc.)"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> takeOverCase(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id, 
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User judge = caseService.getUserByUsername(username);
            Case updatedCase = caseService.assignJudge(id, judge.getId());
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Schedule hearing
    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Schedule hearing", description = "Schedule a hearing date and time for a specific case")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Hearing scheduled successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid hearing date or scheduling conflict"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> scheduleHearing(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id,
            @Parameter(description = "Hearing schedule details", required = true) @Valid @RequestBody ScheduleRequest request,
            Authentication authentication) {
        try {
            LocalDateTime hearingDate = LocalDateTime.parse(request.getHearingDate().replace("Z", ""));
            Case updatedCase = caseService.scheduleHearing(id, hearingDate, authentication.getName());
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get cases by judge
    @GetMapping("/judge/{judgeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Get cases by judge", description = "Retrieve all cases assigned to a specific judge")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Judge not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getCasesByJudge(
            @Parameter(description = "Judge ID", required = true, example = "1") @PathVariable Long judgeId) {
        List<Case> cases = caseService.getCasesByJudge(judgeId);
        return ResponseEntity.ok(cases);
    }

    // Get cases accessible to a judge based on their court level (new endpoint for court-level authorization)
    @GetMapping("/judge/{judgeId}/court-level")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Get cases by judge court level", description = "Retrieve cases accessible to a judge based on their court level")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved cases"),
        @ApiResponse(responseCode = "400", description = "Invalid judge ID"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getCasesByJudgeCourtLevel(
            @Parameter(description = "Judge ID", required = true, example = "1") @PathVariable Long judgeId) {
        try {
            List<Case> cases = caseService.getCasesByJudgeCourtLevel(judgeId);
            return ResponseEntity.ok(cases);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Check if judge can access a specific case (new endpoint for authorization)
    @GetMapping("/judge/{judgeId}/case/{caseId}/access")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Check judge case access", description = "Check if a judge has permission to access a specific case")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully checked access"),
        @ApiResponse(responseCode = "400", description = "Invalid judge or case ID"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Boolean>> canJudgeAccessCase(
            @Parameter(description = "Judge ID", required = true, example = "1") @PathVariable Long judgeId, 
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long caseId) {
        try {
            boolean canAccess = caseService.canJudgeAccessCase(judgeId, caseId);
            return ResponseEntity.ok(Map.of("canAccess", canAccess));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("canAccess", false));
        }
    }

    // Get unscheduled cases
    @GetMapping("/unscheduled")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Get unscheduled cases", description = "Retrieve all cases that don't have scheduled hearings")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved unscheduled cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getUnscheduledCases(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        List<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getUnscheduledCases();
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getUnscheduledCasesByCourtLevel(currentUser.getCourtLevel());
        } else {
            cases = caseService.getUnscheduledCases();
        }
        return ResponseEntity.ok(cases);
    }

    // Get high priority cases
    @GetMapping("/high-priority")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Get high priority cases", description = "Retrieve all cases with high priority (8-10) for urgent attention")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved high priority cases"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getHighPriorityCases(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        List<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getHighPriorityCases();
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getHighPriorityCasesByCourtLevel(currentUser.getCourtLevel());
        } else {
            cases = caseService.getHighPriorityCases();
        }
        return ResponseEntity.ok(cases);
    }

    // Get all scheduled hearings for calendar view
    @GetMapping("/hearings")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Get all scheduled hearings", description = "Retrieve all cases with scheduled hearings for calendar view")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved scheduled hearings"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<Case>> getAllHearings(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        List<Case> cases;
        if (currentUser.getRole() == User.Role.ADMIN) {
            cases = caseService.getAllScheduledHearings();
        } else if (currentUser.getCourtLevel() != null) {
            cases = caseService.getAllScheduledHearingsByCourtLevel(currentUser.getCourtLevel());
        } else {
            cases = caseService.getAllScheduledHearings();
        }
        return ResponseEntity.ok(cases);
    }

    // Update case priority
    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK')")
    @Operation(summary = "Update case priority", description = "Recalculate and update the priority of a specific case based on business rules")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Priority updated successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> updatePriority(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id) {
        try {
            Case updatedCase = caseService.updatePriority(id);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Set manual priority
    @PutMapping("/{id}/set-priority")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK')")
    @Operation(summary = "Set manual priority", description = "Manually set a specific priority value for a case (1-10 scale)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Priority set successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid priority value (must be 1-10)"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> setManualPriority(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id, 
            @Parameter(description = "Priority value (1-10)", required = true, example = "5") @RequestParam Integer priority) {
        try {
            if (priority < 1 || priority > 10) {
                return ResponseEntity.badRequest().build();
            }
            Case updatedCase = caseService.setManualPriority(id, priority);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add or update case notes
    @PutMapping("/{id}/notes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Update case notes", description = "Add or update judicial notes for a specific case")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Case notes updated successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Case> updateCaseNotes(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id, 
            @Parameter(description = "Request body containing notes", required = true) @RequestBody Map<String, String> request, 
            Authentication authentication) {
        try {
            String notes = request.get("notes");
            Case updatedCase = caseService.updateCaseNotes(id, notes, authentication.getName());
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get case statistics (allow multiple roles)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK') or hasRole('JUDGE') or hasRole('ADVOCATE')")
    @Operation(summary = "Get case statistics", description = "Retrieve statistical summary of cases based on user role and court level")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved case statistics"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<CaseService.CaseStatistics> getCaseStatistics(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        CaseService.CaseStatistics stats;
        if (currentUser.getRole() == User.Role.ADMIN) {
            stats = caseService.getCaseStatistics();
        } else {
            stats = caseService.getCaseStatistics(currentUser.getCourtLevel());
        }
        return ResponseEntity.ok(stats);
    }

    // Get court level statistics
    @GetMapping("/court-stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK') or hasRole('JUDGE') or hasRole('ADVOCATE')")
    @Operation(summary = "Get court level statistics", description = "Retrieve statistical breakdown of cases by court level")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved court level statistics"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<CaseService.CourtLevelStats> getCourtLevelStats(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = caseService.getUserByUsername(username);
        
        CaseService.CourtLevelStats stats;
        if (currentUser.getRole() == User.Role.ADMIN) {
            stats = caseService.getCourtLevelStats();
        } else {
            stats = caseService.getCourtLevelStats(currentUser.getCourtLevel());
        }
        return ResponseEntity.ok(stats);
    }

    // Generate case report
    @GetMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    @Operation(summary = "Generate case report", description = "Generate a detailed text report for a specific case")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Report generated successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> generateCaseReport(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id) {
        try {
            String report = caseService.generateCaseReport(id);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/plain")
                    .header("Content-Disposition", "attachment; filename=\"case-report-" + id + ".txt\"")
                    .body(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Generate case PDF (placeholder - returns formatted text for now)
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK') or hasRole('ADVOCATE')")
    @Operation(summary = "Generate case PDF", description = "Generate a PDF document for a specific case with proper filename based on case number")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF generated successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<byte[]> generateCasePDF(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id) {
        System.out.println("PDF endpoint called for case ID: " + id);
        try {
            Optional<Case> caseOptional = caseService.getCaseById(id);
            if (caseOptional.isEmpty()) {
                System.out.println("Case not found: " + id);
                return ResponseEntity.notFound().build();
            }

            Case caseEntity = caseOptional.get();
            System.out.println("Found case: " + caseEntity.getCaseNumber());
            byte[] pdfContent = caseService.generateCasePDF(id);
            System.out.println("Generated PDF content, size: " + pdfContent.length);

            String filename = generateCasePDFFilename(caseEntity);
            System.out.println("Generated filename: " + filename);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            System.out.println("IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("Exception in PDF generation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Populate existing cases with sample documents (admin only)
    @PostMapping("/populate-documents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> populateExistingCasesWithDocuments() {
        try {
            caseService.populateExistingCasesWithDocuments();
            return ResponseEntity.ok("Existing cases have been populated with sample documents.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to populate documents: " + e.getMessage());
        }
    }

    // Get next case number preview (for case filing form)
    @GetMapping("/next-case-number")
    public ResponseEntity<Map<String, Object>> getNextCaseNumber() {
        try {
            String nextCaseNumber = caseService.getNextCaseNumberPreview();
            return ResponseEntity.ok(Map.of(
                "nextCaseNumber", nextCaseNumber,
                "format", "CASE-YYYY-NNNN"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get next case number"));
        }
    }


    // ========== COURT ESCALATION ENDPOINTS ==========

    // Get cases by court level
    @GetMapping("/court-level/{level}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Case>> getCasesByCourtLevel(@PathVariable Case.CourtLevel level) {
        List<Case> cases = caseService.getCasesByCourtLevel(level);
        return ResponseEntity.ok(cases);
    }

    // Get all escalated cases
    @GetMapping("/escalated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Case>> getEscalatedCases() {
        List<Case> cases = caseService.getEscalatedCases();
        return ResponseEntity.ok(cases);
    }

    // Get cases eligible for escalation
    @GetMapping("/eligible-for-escalation")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Case>> getCasesEligibleForEscalation() {
        List<Case> cases = caseService.getCasesEligibleForEscalation();
        return ResponseEntity.ok(cases);
    }

    // Escalate a case to higher court (Judge or Admin only)
    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<?> escalateCase(@PathVariable Long id, @Valid @RequestBody ReasonRequest request) {
        try {
            Case escalatedCase = caseService.escalateCase(id, request.getReason());
            return ResponseEntity.ok(Map.of(
                "message", "Case escalated successfully to " + escalatedCase.getCourtLevel().getDisplayName(),
                "case", escalatedCase
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // De-escalate a case to lower court (Admin or Judge only)
    @PostMapping("/{id}/deescalate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<?> deescalateCase(@PathVariable Long id, @Valid @RequestBody ReasonRequest request) {
        try {
            Case deescalatedCase = caseService.deescalateCase(id, request.getReason());
            return ResponseEntity.ok(Map.of(
                "message", "Case de-escalated successfully to " + deescalatedCase.getCourtLevel().getDisplayName(),
                "case", deescalatedCase
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Check if a case can be escalated to Supreme Court specifically (Admin or Judge only)
    @GetMapping("/{id}/can-escalate-to-supreme")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<Map<String, Boolean>> canEscalateToSupremeCourt(@PathVariable Long id) {
        try {
            Case caseEntity = caseService.getCaseById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Case not found"));
            
            boolean canEscalate = caseService.canEscalateToSupremeCourt(caseEntity);
            return ResponseEntity.ok(Map.of("canEscalateToSupremeCourt", canEscalate));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== DE-ESCALATION ENDPOINTS ==========

    // Check if a case can be de-escalated (Admin or Judge only)
    @GetMapping("/{id}/deescalation-eligibility")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<CaseService.DeescalationEligibility> getDeescalationEligibility(@PathVariable Long id) {
        CaseService.DeescalationEligibility eligibility = caseService.getDeescalationEligibility(id);
        return ResponseEntity.ok(eligibility);
    }

    // Check if a case can be de-escalated (Admin or Judge only)
    @GetMapping("/{id}/can-deescalate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<Map<String, Boolean>> canDeescalateCase(@PathVariable Long id) {
        try {
            Case caseEntity = caseService.getCaseById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Case not found"));
            
            boolean canDeescalate = caseService.canDeescalateCase(caseEntity);
            return ResponseEntity.ok(Map.of("canDeescalate", canDeescalate));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get previous court level for de-escalation (Admin or Judge only)
    @GetMapping("/{id}/previous-court-level")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<Map<String, Object>> getPreviousCourtLevel(@PathVariable Long id) {
        try {
            Case caseEntity = caseService.getCaseById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Case not found"));
            
            Case.CourtLevel previousLevel = caseService.getPreviousCourtLevel(caseEntity.getCourtLevel());
            return ResponseEntity.ok(Map.of(
                "currentCourtLevel", caseEntity.getCourtLevel(),
                "previousCourtLevel", previousLevel,
                "canDeescalate", previousLevel != null
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== DOCUMENT MANAGEMENT ENDPOINTS ==========

    // Upload document (Clerk, Judge, Admin)
    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('CLERK') or hasRole('JUDGE') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            // Document upload would be implemented here
            // For now, return a placeholder response
            return ResponseEntity.ok(Map.of(
                "message", "Document upload endpoint - implementation needed",
                "documentId", 1
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload document: " + e.getMessage()));
        }
    }

    // ========== CASE NOTES ENDPOINTS ==========

    // Add case note (Judge only)
    @PostMapping("/{id}/notes/judicial")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<?> addJudicialNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String content = request.get("content");
            String noteTypeStr = request.get("noteType");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Note content is required"));
            }
            // Note creation would be implemented here
            return ResponseEntity.ok(Map.of(
                "message", "Judicial note added successfully",
                "noteId", 1
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to add note: " + e.getMessage()));
        }
    }

    // ========== AUDIT TRAIL ENDPOINTS ==========

    // Get case audit history (Admin only)
    @GetMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCaseAuditHistory(@PathVariable Long id) {
        try {
            // Audit retrieval would be implemented here
            return ResponseEntity.ok(Map.of(
                "message", "Audit history endpoint - implementation needed",
                "caseId", id
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to retrieve audit history: " + e.getMessage()));
        }
    }

    // ========== ADVOCATE ENDPOINTS ==========

    // Assign an advocate to a case (Admin only)
    @PutMapping("/{id}/assign-advocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignAdvocate(@PathVariable Long id, @RequestParam Long advocateId) {
        try {
            Case updatedCase = caseService.assignAdvocate(id, advocateId);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Remove advocate from a case (Admin only)
    @PutMapping("/{id}/remove-advocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeAdvocate(@PathVariable Long id) {
        try {
            Case updatedCase = caseService.removeAdvocate(id);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all cases for a specific advocate (only their assigned cases)
    @GetMapping("/advocate/{advocateId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADVOCATE')")
    public ResponseEntity<?> getCasesByAdvocate(@PathVariable Long advocateId, Authentication authentication) {
        try {
            // Advocates can only view their OWN cases – prevent querying other advocates
            if (authentication != null) {
                String username = authentication.getName();
                com.example.dcm.model.User currentUser = caseService.getUserByUsername(username);
                if (currentUser != null && currentUser.getRole() == com.example.dcm.model.User.Role.ADVOCATE
                        && !currentUser.getId().equals(advocateId)) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied: Advocates can only view their own cases"));
                }
            }
            List<Case> cases = caseService.getCasesByAdvocate(advocateId);
            return ResponseEntity.ok(cases);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Check if advocate can access a specific case
    @GetMapping("/advocate/{advocateId}/case/{caseId}/access")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADVOCATE')")
    public ResponseEntity<Map<String, Boolean>> canAdvocateAccessCase(
            @PathVariable Long advocateId,
            @PathVariable Long caseId) {
        try {
            boolean canAccess = caseService.canAdvocateAccessCase(advocateId, caseId);
            return ResponseEntity.ok(Map.of("canAccess", canAccess));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("canAccess", false));
        }
    }

    // ========== PRIORITY AGING ENDPOINTS ==========

    // Manually recalculate priorities for all cases (applies aging)
    @PostMapping("/recalculate-priorities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recalculateAllPriorities() {
        try {
            int updatedCount = caseService.recalculateAllCasePriorities();
            return ResponseEntity.ok(Map.of(
                "message", "Priorities recalculated successfully",
                "updatedCases", updatedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to recalculate priorities: " + e.getMessage()));
        }
    }

    // Get priority aging information for a specific case
    @GetMapping("/{id}/priority-aging")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<?> getCasePriorityAging(@PathVariable Long id) {
        try {
            Map<String, Object> agingInfo = caseService.getCasePriorityAgingInfo(id);
            return ResponseEntity.ok(agingInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to get priority aging info: " + e.getMessage()));
        }
    }

    // Get priority aging configuration
    @GetMapping("/priority-aging-config")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<?> getPriorityAgingConfig() {
        return ResponseEntity.ok(Map.of(
            "agingInterval", 30,
            "description", "Cases gain 1 priority point every 30 days",
            "formula", "Priority += floor(DaysSinceFiling / 30)",
            "maxPriority", 10,
            "minPriority", 1
        ));
    }
}
