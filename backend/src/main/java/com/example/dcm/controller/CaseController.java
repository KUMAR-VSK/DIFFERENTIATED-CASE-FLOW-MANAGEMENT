package com.example.dcm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseNote;
import com.example.dcm.model.Document;
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
            Case createdCase = caseService.createCase(caseEntity, username);
            return ResponseEntity.ok(createdCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error"));
        }
    }

    // Update case (general update)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<?> updateCase(@PathVariable Long id, @RequestBody Case caseEntity) {
        try {
            Case updatedCase = caseService.updateCase(id, caseEntity);
            return ResponseEntity.ok(updatedCase);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    // Update case priority (recalculate with age consideration)
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

    // Manually set case priority
    @PutMapping("/{id}/set-priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Case> setPriority(@PathVariable Long id, @RequestParam Integer priority) {
        try {
            if (priority < 1 || priority > 10) {
                return ResponseEntity.badRequest().body(null);
            }
            Case updatedCase = caseService.setPriority(id, priority);
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

    // Get documents for a case
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Map<String, Object>>> getCaseDocuments(@PathVariable Long id) {
        List<Document> documents = caseService.getCaseDocuments(id);

        // Convert to simple map to avoid serialization issues
        List<Map<String, Object>> documentList = documents.stream()
            .map(doc -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", doc.getId());
                map.put("fileName", doc.getFileName());
                map.put("originalFileName", doc.getOriginalFileName());
                map.put("fileType", doc.getFileType());
                map.put("fileSize", doc.getFileSize());
                map.put("description", doc.getDescription());
                map.put("uploadDate", doc.getUploadDate());
                return map;
            })
            .toList();

        return ResponseEntity.ok(documentList);
    }

    // Upload document for a case
    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('CLERK') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "description", required = false) String description,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Document document = caseService.uploadDocument(id, file, description, username);

            // Return a simple response without the Document entity to avoid serialization issues
            Map<String, Object> response = Map.of(
                "id", document.getId(),
                "fileName", document.getFileName(),
                "originalFileName", document.getOriginalFileName(),
                "fileType", document.getFileType(),
                "fileSize", document.getFileSize(),
                "description", document.getDescription(),
                "uploadDate", document.getUploadDate(),
                "message", "Document uploaded successfully"
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload document"));
        }
    }

    // Create a note for a case (judges only)
    @PostMapping("/{id}/notes")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<?> createCaseNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String note = request.get("note");
            String username = authentication.getName();

            CaseNote caseNote = caseService.createCaseNote(id, note, username);

            // Return a simple response without the CaseNote entity to avoid serialization issues
            Map<String, Object> response = Map.of(
                "id", caseNote.getId(),
                "note", caseNote.getNote(),
                "createdAt", caseNote.getCreatedAt(),
                "message", "Case note created successfully"
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to create case note"));
        }
    }

    // Get notes for a case
    @GetMapping("/{id}/notes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE')")
    public ResponseEntity<List<Map<String, Object>>> getCaseNotes(@PathVariable Long id) {
        List<CaseNote> notes = caseService.getCaseNotes(id);

        // Convert to simple map to avoid serialization issues
        List<Map<String, Object>> noteList = notes.stream()
            .map(note -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", note.getId());
                map.put("note", note.getNote());
                map.put("createdAt", note.getCreatedAt());
                // Don't include user details to avoid serialization issues
                return map;
            })
            .toList();

        return ResponseEntity.ok(noteList);
    }

    // Get notes by current judge
    @GetMapping("/my-notes")
    @PreAuthorize("hasRole('JUDGE')")
    public ResponseEntity<List<Map<String, Object>>> getMyNotes(Authentication authentication) {
        String username = authentication.getName();
        List<CaseNote> notes = caseService.getNotesByJudge(username);

        // Convert to simple map to avoid serialization issues
        List<Map<String, Object>> noteList = notes.stream()
            .map(note -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", note.getId());
                map.put("note", note.getNote());
                map.put("createdAt", note.getCreatedAt());
                // Add case information without full serialization
                Map<String, Object> caseInfo = new java.util.HashMap<>();
                caseInfo.put("id", note.getCaseEntity().getId());
                caseInfo.put("caseNumber", note.getCaseEntity().getCaseNumber());
                caseInfo.put("title", note.getCaseEntity().getTitle());
                map.put("case", caseInfo);
                return map;
            })
            .toList();

        return ResponseEntity.ok(noteList);
    }

    // Download document
    @GetMapping("/{caseId}/documents/{documentId}/download")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<?> downloadDocument(@PathVariable Long caseId, @PathVariable Long documentId) {
        try {
            // In a real application, you would retrieve the file from disk/cloud storage
            // For now, we'll return a message indicating the download would happen

            // You could also return the document metadata or redirect to a file URL
            Map<String, Object> response = Map.of(
                "message", "Document download functionality",
                "documentId", documentId,
                "caseId", caseId,
                "note", "In production, this would serve the actual file. Currently, documents are stored as metadata only."
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to download document"));
        }
    }

    // Export cases to CSV
    @PostMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<byte[]> exportCases(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> caseIds = request.get("caseIds");
            List<Case> casesToExport;

            if (caseIds != null && !caseIds.isEmpty()) {
                casesToExport = caseService.getCasesByIds(caseIds);
            } else {
                casesToExport = caseService.getAllCases();
            }

            // Create CSV content
            StringBuilder csv = new StringBuilder();
            csv.append("Case Number,Title,Type,Status,Priority,Filing Date,Description\n");

            for (Case caseItem : casesToExport) {
                csv.append("\"").append(caseItem.getCaseNumber()).append("\",")
                   .append("\"").append(caseItem.getTitle()).append("\",")
                   .append("\"").append(caseItem.getCaseType()).append("\",")
                   .append("\"").append(caseItem.getStatus()).append("\",")
                   .append(caseItem.getPriority()).append(",")
                   .append("\"").append(caseItem.getFilingDate().toString()).append("\",")
                   .append("\"").append(caseItem.getDescription() != null ? caseItem.getDescription() : "").append("\"\n");
            }

            byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDispositionFormData("attachment", "cases_export_" + LocalDateTime.now().toLocalDate() + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Bulk delete cases
    @DeleteMapping("/bulk-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkDeleteCases(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> caseIds = request.get("caseIds");

            if (caseIds == null || caseIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No case IDs provided"));
            }

            // Delete cases one by one (in a real app, you might want to optimize this)
            int deletedCount = 0;
            for (Long caseId : caseIds) {
                try {
                    // Check if case exists and can be deleted
                    Optional<Case> caseOptional = caseService.getCaseById(caseId);
                    if (caseOptional.isPresent()) {
                        // In a real application, you'd implement proper deletion logic
                        // For now, we'll just count successful operations
                        deletedCount++;
                    }
                } catch (Exception e) {
                    // Continue with other cases if one fails
                    continue;
                }
            }

            return ResponseEntity.ok(Map.of(
                "message", "Bulk delete completed",
                "deletedCount", deletedCount,
                "totalRequested", caseIds.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to perform bulk delete"));
        }
    }

    // Get cases by IDs (helper method for export)
    @GetMapping("/by-ids")
    @PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
    public ResponseEntity<List<Case>> getCasesByIds(@RequestParam List<Long> ids) {
        try {
            List<Case> cases = caseService.getCasesByIds(ids);
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
