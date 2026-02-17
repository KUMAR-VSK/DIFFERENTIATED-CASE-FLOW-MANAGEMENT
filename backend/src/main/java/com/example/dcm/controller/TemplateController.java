package com.example.dcm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.dcm.model.*;
import com.example.dcm.repository.*;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class TemplateController {

    @Autowired
    private CaseTemplateRepository templateRepository;

    @Autowired
    private CaseChecklistItemRepository checklistRepository;

    @Autowired
    private CaseRepository caseRepository;

    /**
     * Get all active case templates
     */
    @GetMapping
    public ResponseEntity<List<CaseTemplate>> getAllActiveTemplates() {
        List<CaseTemplate> templates = templateRepository.findByIsActiveTrue();
        return ResponseEntity.ok(templates);
    }

    /**
     * Get templates by case type
     */
    @GetMapping("/by-type/{caseType}")
    public ResponseEntity<List<CaseTemplate>> getTemplatesByCaseType(@PathVariable Case.CaseType caseType) {
        List<CaseTemplate> templates = templateRepository.findActiveByCaseType(caseType);
        return ResponseEntity.ok(templates);
    }

    /**
     * Get specific template by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CaseTemplate> getTemplate(@PathVariable Long id) {
        Optional<CaseTemplate> template = templateRepository.findById(id);
        return template.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new template (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaseTemplate> createTemplate(@RequestBody CaseTemplate template) {
        CaseTemplate saved = templateRepository.save(template);
        return ResponseEntity.ok(saved);
    }

    /**
     * Update template (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaseTemplate> updateTemplate(@PathVariable Long id, @RequestBody CaseTemplate template) {
        Optional<CaseTemplate> existing = templateRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        template.setId(id);
        CaseTemplate updated = templateRepository.save(template);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get checklist items for a case
     */
    @GetMapping("/checklist/{caseId}")
    public ResponseEntity<List<CaseChecklistItem>> getCaseChecklist(@PathVariable Long caseId) {
        List<CaseChecklistItem> items = checklistRepository.findByCaseIdOrderByStepNumber(caseId);
        return ResponseEntity.ok(items);
    }

    /**
     * Create checklist item for a case
     */
    @PostMapping("/checklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE', 'CLERK')")
    public ResponseEntity<CaseChecklistItem> createChecklistItem(@RequestBody CaseChecklistItem item) {
        CaseChecklistItem saved = checklistRepository.save(item);
        return ResponseEntity.ok(saved);
    }

    /**
     * Update checklist item status
     */
    @PutMapping("/checklist/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE', 'CLERK')")
    public ResponseEntity<CaseChecklistItem> updateChecklistItem(
            @PathVariable Long id, 
            @RequestBody CaseChecklistItem item) {
        
        Optional<CaseChecklistItem> existing = checklistRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        item.setId(id);
        
        // If marking as completed, set completion time
        if (item.getStatus() == CaseChecklistItem.ChecklistStatus.COMPLETED && 
            existing.get().getStatus() != CaseChecklistItem.ChecklistStatus.COMPLETED) {
            item.setCompletedAt(LocalDateTime.now());
        }
        
        CaseChecklistItem updated = checklistRepository.save(item);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get checklist completion percentage
     */
    @GetMapping("/checklist/{caseId}/progress")
    public ResponseEntity<Double> getChecklistProgress(@PathVariable Long caseId) {
        Long completedItems = checklistRepository.countCompletedItemsByCaseId(caseId);
        Long totalItems = checklistRepository.countTotalItemsByCaseId(caseId);
        
        double progress = totalItems > 0 ? (double) completedItems / totalItems * 100 : 0.0;
        return ResponseEntity.ok(progress);
    }

    /**
     * Apply template to a case (create checklist items from template)
     */
    @PostMapping("/apply/{templateId}/to-case/{caseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLERK')")
    public ResponseEntity<List<CaseChecklistItem>> applyTemplateToCase(
            @PathVariable Long templateId, 
            @PathVariable Long caseId) {
        
        Optional<CaseTemplate> templateOpt = templateRepository.findById(templateId);
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        
        if (templateOpt.isEmpty() || caseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CaseTemplate template = templateOpt.get();
        Case caseEntity = caseOpt.get();

        // Parse checklist items from template (assuming JSON format)
        // This is a simplified version - you'd parse the JSON string in production
        List<CaseChecklistItem> items = List.of(); // Parse from template.getChecklistItems()
        
        // Save all checklist items
        items = checklistRepository.saveAll(items);
        
        return ResponseEntity.ok(items);
    }
}
