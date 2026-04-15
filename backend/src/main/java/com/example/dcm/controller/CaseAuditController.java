package com.example.dcm.controller;

import com.example.dcm.model.CaseAudit;
import com.example.dcm.repository.CaseAuditRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
@Tag(name = "Case Audit", description = "Case audit history and activity tracking")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class CaseAuditController {

    @Autowired
    private CaseAuditRepository caseAuditRepository;

    /**
     * GET /api/cases/{caseId}/history
     * Returns paginated audit history for a case, with optional filters:
     *   ?actionType=STATUS_CHANGED
     *   ?from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
     *   ?page=0&size=20&sortBy=createdAt&direction=desc
     */
    @GetMapping("/{caseId}/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK') or hasRole('ADVOCATE')")
    @Operation(summary = "Get case audit history", description = "Returns paginated audit history for a specific case with optional filters")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Audit history retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Case not found")
    })
    public ResponseEntity<Page<CaseAudit>> getCaseHistory(
            @Parameter(description = "Case ID", required = true) @PathVariable Long caseId,
            @Parameter(description = "Filter by action type") @RequestParam(required = false) CaseAudit.ActionType actionType,
            @Parameter(description = "Filter from date (ISO format)") @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @Parameter(description = "Filter to date (ISO format)") @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<CaseAudit> results;

        boolean hasType  = actionType != null;
        boolean hasRange = from != null && to != null;

        if (hasType && hasRange) {
            results = caseAuditRepository.findByCaseEntityIdAndActionTypeAndCreatedAtBetween(
                    caseId, actionType, from, to, pageable);
        } else if (hasType) {
            results = caseAuditRepository.findByCaseEntityIdAndActionType(caseId, actionType, pageable);
        } else if (hasRange) {
            results = caseAuditRepository.findByCaseEntityIdAndCreatedAtBetween(caseId, from, to, pageable);
        } else {
            results = caseAuditRepository.findByCaseEntityId(caseId, pageable);
        }

        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/cases/history/recent
     * Returns 15 most recent audit records across ALL cases for the dashboard feed.
     */
    @GetMapping("/history/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    @Operation(summary = "Get recent audit history", description = "Returns 15 most recent audit records across all cases for dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recent audit history retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<List<CaseAudit>> getGlobalRecentHistory() {
        List<CaseAudit> recent = caseAuditRepository.findTop15ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recent);
    }
}
