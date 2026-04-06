package com.example.dcm.controller;

import com.example.dcm.model.CaseAudit;
import com.example.dcm.repository.CaseAuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cases/{caseId}/history")
@CrossOrigin(origins = "*")
public class CaseAuditController {

    @Autowired
    private CaseAuditRepository caseAuditRepository;

    /**
     * GET /api/cases/{caseId}/history
     * Returns full audit history for a case, with optional filters:
     *   ?actionType=STATUS_CHANGED
     *   ?from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK') or hasRole('ADVOCATE')")
    public ResponseEntity<List<CaseAudit>> getCaseHistory(
            @PathVariable Long caseId,
            @RequestParam(required = false) CaseAudit.ActionType actionType,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<CaseAudit> results;

        boolean hasType  = actionType != null;
        boolean hasRange = from != null && to != null;

        if (hasType && hasRange) {
            results = caseAuditRepository.findByCaseEntityIdAndActionTypeAndCreatedAtBetween(
                    caseId, actionType, from, to);
        } else if (hasType) {
            results = caseAuditRepository.findByCaseEntityIdAndActionType(caseId, actionType);
        } else if (hasRange) {
            results = caseAuditRepository.findByCaseEntityIdAndCreatedAtBetween(caseId, from, to);
        } else {
            results = caseAuditRepository.findByCaseEntityId(caseId);
        }

        // Sort ascending (oldest first)
        results.sort((a, b) -> {
            if (a.getCreatedAt() == null) return -1;
            if (b.getCreatedAt() == null) return 1;
            return a.getCreatedAt().compareTo(b.getCreatedAt());
        });

        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/cases/history/recent
     * Returns 15 most recent audit records across ALL cases for the dashboard feed.
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<CaseAudit>> getGlobalRecentHistory() {
        List<CaseAudit> recent = caseAuditRepository.findTop15ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recent);
    }
}
