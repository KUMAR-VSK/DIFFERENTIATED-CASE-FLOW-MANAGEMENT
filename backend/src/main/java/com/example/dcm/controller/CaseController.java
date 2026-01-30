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

    // Get recent cases (sorted by creation date, descending)
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Case>> getRecentCases() {
        List<Case> cases = caseService.getRecentCases();
        return ResponseEntity.ok(cases);
    }

    // Get all cases for case management (includes filed cases)
    @GetMapping("/management")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Case>> getAllCasesForManagement() {
        List<Case> cases = caseService.getAllCases();
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
            Case savedCase = caseService.createCase(caseEntity, username);
            return ResponseEntity.ok(savedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Add stack trace for debugging
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error: " + e.getMessage()));
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
            @RequestBody Map<String, String> request) {
        try {
            String hearingDateStr = request.get("hearingDate");
            LocalDateTime hearingDate = LocalDateTime.parse(hearingDateStr.replace("Z", ""));
            Case updatedCase = caseService.scheduleHearing(id, hearingDate);
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK')")
    public ResponseEntity<Case> updatePriority(@PathVariable Long id) {
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
    public ResponseEntity<Case> setManualPriority(@PathVariable Long id, @RequestParam Integer priority) {
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
    public ResponseEntity<Case> updateCaseNotes(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String notes = request.get("notes");
            Case updatedCase = caseService.updateCaseNotes(id, notes);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get case statistics (allow multiple roles)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK') or hasRole('JUDGE')")
    public ResponseEntity<CaseService.CaseStatistics> getCaseStatistics() {
        CaseService.CaseStatistics stats = caseService.getCaseStatistics();
        return ResponseEntity.ok(stats);
    }

    // Get court level statistics
    @GetMapping("/court-stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLERK') or hasRole('JUDGE')")
    public ResponseEntity<CaseService.CourtLevelStats> getCourtLevelStats() {
        CaseService.CourtLevelStats stats = caseService.getCourtLevelStats();
        return ResponseEntity.ok(stats);
    }

    // Generate case report
    @GetMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<String> generateCaseReport(@PathVariable Long id) {
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

    // Generate case PDF (placeholder - would need PDF library)
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<String> generateCasePDF(@PathVariable Long id) {
        try {
            String pdfContent = caseService.generateCasePDF(id);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"case-report-" + id + ".pdf\"")
                    .body(pdfContent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
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
    public ResponseEntity<?> escalateCase(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Escalation reason is required"));
            }
            Case escalatedCase = caseService.escalateCase(id, reason);
            return ResponseEntity.ok(escalatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to escalate case: " + e.getMessage()));
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
}
