package com.example.dcm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import com.example.dcm.service.CaseService;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*") // For development - configure properly for production
public class CaseController {

    @Autowired
    private CaseService caseService;

    // Get all cases (for admins and judges)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Case>> getAllCases() {
        List<Case> cases = caseService.getCasesByPriorityOrder();
        return ResponseEntity.ok(cases);
    }

    // Get case by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<Case> getCaseById(@PathVariable Long id) {
        Optional<Case> caseOptional = caseService.getCaseById(id);
        return caseOptional.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    // Create new case (clerks only)
    @PostMapping
    @PreAuthorize("hasRole('CLERK') or hasRole('ADMIN')")
    public ResponseEntity<?> createCase(@RequestBody Case caseEntity, Authentication authentication) {
        try {
            String username = authentication.getName();
            Case createdCase = caseService.createCase(caseEntity, username);
            return ResponseEntity.ok(createdCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error"));
        }
    }

    // Update case status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<Case> updateCaseStatus(@PathVariable Long id, @RequestParam Case.Status status) {
        try {
            Case updatedCase = caseService.updateCaseStatus(id, status);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign judge to case
    @PutMapping("/{id}/assign-judge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Case> assignJudge(@PathVariable Long id, @RequestParam Long judgeId) {
        try {
            Case updatedCase = caseService.assignJudge(id, judgeId);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Schedule hearing
    @PutMapping("/{id}/schedule")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<Case> scheduleHearing(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hearingDate) {
        try {
            Case updatedCase = caseService.scheduleHearing(id, hearingDate);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get cases by judge
    @GetMapping("/judge/{judgeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Case>> getCasesByJudge(@PathVariable Long judgeId) {
        List<Case> cases = caseService.getCasesByJudge(judgeId);
        return ResponseEntity.ok(cases);
    }

    // Get unscheduled cases
    @GetMapping("/unscheduled")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Case>> getUnscheduledCases() {
        List<Case> cases = caseService.getUnscheduledCases();
        return ResponseEntity.ok(cases);
    }

    // Get high priority cases
    @GetMapping("/high-priority")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Case>> getHighPriorityCases() {
        List<Case> cases = caseService.getHighPriorityCases();
        return ResponseEntity.ok(cases);
    }

    // Update case priority
    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Case> updatePriority(@PathVariable Long id) {
        try {
            Case updatedCase = caseService.updatePriority(id);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get case statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaseService.CaseStatistics> getCaseStatistics() {
        CaseService.CaseStatistics stats = caseService.getCaseStatistics();
        return ResponseEntity.ok(stats);
    }
}
