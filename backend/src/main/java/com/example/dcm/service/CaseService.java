package com.example.dcm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseNote;
import com.example.dcm.model.Document;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseNoteRepository;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.DocumentRepository;
import com.example.dcm.repository.UserRepository;

@Service
@Transactional
public class CaseService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CaseNoteRepository caseNoteRepository;

    @Autowired
    private PriorityEngine priorityEngine;

    // Create a new case
    public Case createCase(Case caseEntity, String clerkUsername) {
        // Validate case number uniqueness
        if (caseRepository.existsByCaseNumber(caseEntity.getCaseNumber())) {
            throw new IllegalArgumentException("Case number already exists");
        }

        // Set default status if not provided
        if (caseEntity.getStatus() == null) {
            caseEntity.setStatus(Case.Status.FILED);
        }

        // Set filing clerk
        Optional<User> clerk = userRepository.findByUsername(clerkUsername);
        if (clerk.isPresent()) {
            caseEntity.setFilingClerk(clerk.get());
        }

        // Calculate initial priority
        int calculatedPriority = priorityEngine.calculatePriority(caseEntity);
        caseEntity.setPriority(calculatedPriority);

        return caseRepository.save(caseEntity);
    }

    // Update case status
    public Case updateCaseStatus(Long caseId, Case.Status newStatus) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setStatus(newStatus);
        return caseRepository.save(caseEntity);
    }

    // Update case details
    public Case updateCase(Long caseId, Case updatedCase) {
        Case existingCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Update allowed fields
        if (updatedCase.getTitle() != null) existingCase.setTitle(updatedCase.getTitle());
        if (updatedCase.getDescription() != null) existingCase.setDescription(updatedCase.getDescription());
        if (updatedCase.getCaseType() != null) existingCase.setCaseType(updatedCase.getCaseType());
        if (updatedCase.getResourceRequirement() != null) existingCase.setResourceRequirement(updatedCase.getResourceRequirement());
        if (updatedCase.getEstimatedDurationDays() != null) existingCase.setEstimatedDurationDays(updatedCase.getEstimatedDurationDays());

        // Recalculate priority if case type or other factors changed
        int newPriority = priorityEngine.calculatePriority(existingCase);
        existingCase.setPriority(newPriority);

        return caseRepository.save(existingCase);
    }

    // Assign judge to case
    public Case assignJudge(Long caseId, Long judgeId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("User is not a judge");
        }

        caseEntity.setAssignedJudge(judge);
        caseEntity.setStatus(Case.Status.SCHEDULED);
        return caseRepository.save(caseEntity);
    }

    // Schedule hearing
    public Case scheduleHearing(Long caseId, LocalDateTime hearingDate) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        if (caseEntity.getAssignedJudge() == null) {
            throw new IllegalArgumentException("Cannot schedule hearing without assigned judge");
        }

        caseEntity.setHearingDate(hearingDate);
        caseEntity.setStatus(Case.Status.SCHEDULED);
        return caseRepository.save(caseEntity);
    }

    // Get cases by priority order (for scheduling)
    public List<Case> getCasesByPriorityOrder() {
        return caseRepository.findByStatusOrderByPriorityDescFilingDateAsc(
            List.of(Case.Status.UNDER_REVIEW, Case.Status.SCHEDULED)
        );
    }

    // Get unscheduled cases
    public List<Case> getUnscheduledCases() {
        return caseRepository.findUnscheduledCasesOrderByPriority();
    }

    // Get cases assigned to judge
    public List<Case> getCasesByJudge(Long judgeId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        return caseRepository.findByAssignedJudge(judge);
    }

    // Get high priority cases
    public List<Case> getHighPriorityCases() {
        return caseRepository.findByPriorityGreaterThanEqual(8);
    }

    // Update case priority (recalculate with age consideration)
    public Case updatePriority(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Recalculate priority with age consideration
        int newPriority = priorityEngine.adjustPriorityForAge(caseEntity);
        caseEntity.setPriority(newPriority);

        return caseRepository.save(caseEntity);
    }

    // Manually set case priority
    public Case setPriority(Long caseId, Integer priority) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        if (priority < 1 || priority > 10) {
            throw new IllegalArgumentException("Priority must be between 1 and 10");
        }

        caseEntity.setPriority(priority);
        return caseRepository.save(caseEntity);
    }

    // Get case statistics
    public CaseStatistics getCaseStatistics() {
        List<Case> allCases = caseRepository.findAll();

        long totalCases = allCases.size();
        long filedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.FILED ? 1 : 0).sum();
        long scheduledCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.SCHEDULED ? 1 : 0).sum();
        long completedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.COMPLETED ? 1 : 0).sum();

        double avgPriority = allCases.stream().mapToInt(Case::getPriority).average().orElse(0.0);

        return new CaseStatistics(totalCases, filedCases, scheduledCases, completedCases, avgPriority);
    }

    // Get case by ID
    public Optional<Case> getCaseById(Long id) {
        return caseRepository.findById(id);
    }

    // Get all cases
    public List<Case> getAllCases() {
        return caseRepository.findAll();
    }

    // Get cases by IDs
    public List<Case> getCasesByIds(List<Long> ids) {
        return caseRepository.findAllById(ids);
    }

    // Get documents for a case
    public List<Document> getCaseDocuments(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));
        return documentRepository.findByCaseEntityIdOrderByUploadDateDesc(caseId);
    }

    // Upload document for a case
    public Document uploadDocument(Long caseId, MultipartFile file, String description, String username) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Save file (for now, we'll just store metadata - in production, save to file system or cloud storage)
        try {
            // For demo purposes, we'll just store the metadata
            // In a real application, you'd save the file to a directory or cloud storage
            Document document = new Document(
                uniqueFilename,
                originalFilename,
                file.getContentType(),
                file.getSize(),
                caseEntity,
                uploader
            );

            if (description != null && !description.trim().isEmpty()) {
                document.setDescription(description.trim());
            }

            return documentRepository.save(document);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save document: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    // Create a note for a case (judges only)
    public CaseNote createCaseNote(Long caseId, String note, String judgeUsername) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User judge = userRepository.findByUsername(judgeUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("Only judges can create case notes");
        }

        if (note == null || note.trim().isEmpty()) {
            throw new IllegalArgumentException("Note cannot be empty");
        }

        CaseNote caseNote = new CaseNote(note.trim(), caseEntity, judge);
        return caseNoteRepository.save(caseNote);
    }

    // Get notes for a case
    public List<CaseNote> getCaseNotes(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        return caseNoteRepository.findByCaseEntityOrderByCreatedAtDesc(caseEntity);
    }

    // Get notes by judge
    public List<CaseNote> getNotesByJudge(String judgeUsername) {
        User judge = userRepository.findByUsername(judgeUsername)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        return caseNoteRepository.findByCreatedByOrderByCreatedAtDesc(judge);
    }

    // Inner class for statistics
    public static class CaseStatistics {
        private final long totalCases;
        private final long filedCases;
        private final long scheduledCases;
        private final long completedCases;
        private final double averagePriority;

        public CaseStatistics(long totalCases, long filedCases, long scheduledCases, long completedCases, double averagePriority) {
            this.totalCases = totalCases;
            this.filedCases = filedCases;
            this.scheduledCases = scheduledCases;
            this.completedCases = completedCases;
            this.averagePriority = averagePriority;
        }

        // Getters
        public long getTotalCases() { return totalCases; }
        public long getFiledCases() { return filedCases; }
        public long getScheduledCases() { return scheduledCases; }
        public long getCompletedCases() { return completedCases; }
        public double getAveragePriority() { return averagePriority; }
    }
}
