package com.example.dcm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dcm.model.Case;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.UserRepository;

@Service
@Transactional
public class CaseService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PriorityEngine priorityEngine;

    // Create a new case
    public Case createCase(Case caseEntity, String clerkUsername) {
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

        // Add sample documents to new cases
        addSampleDocuments(caseEntity);

        Case savedCase = caseRepository.save(caseEntity);

        // Recalculate priorities for all existing cases to maintain relative priority accuracy
        List<Case> allCases = caseRepository.findAll();
        priorityEngine.recalculateAllPriorities(allCases);

        // Save all updated cases
        caseRepository.saveAll(allCases);

        return savedCase;
    }

    // Update case status
    public Case updateCaseStatus(Long caseId, Case.Status newStatus) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setStatus(newStatus);
        return caseRepository.save(caseEntity);
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

        caseEntity.setHearingDate(hearingDate);
        // Only change status to SCHEDULED if it's not already in a more advanced state
        if (caseEntity.getStatus() == Case.Status.FILED || caseEntity.getStatus() == Case.Status.UNDER_REVIEW) {
            caseEntity.setStatus(Case.Status.SCHEDULED);
        }
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

    // Update case priority
    public Case updatePriority(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Recalculate priority with age consideration
        int newPriority = priorityEngine.adjustPriorityForAge(caseEntity);
        caseEntity.setPriority(newPriority);

        return caseRepository.save(caseEntity);
    }

    // Set manual priority
    public Case setManualPriority(Long caseId, Integer priority) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setPriority(priority);
        return caseRepository.save(caseEntity);
    }

    // Generate case report
    public String generateCaseReport(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        StringBuilder report = new StringBuilder();
        report.append("CASE MANAGEMENT REPORT\n");
        report.append("======================\n\n");

        report.append("Case Information:\n");
        report.append("- Case Number: ").append(caseEntity.getCaseNumber()).append("\n");
        report.append("- Title: ").append(caseEntity.getTitle()).append("\n");
        report.append("- Case Type: ").append(caseEntity.getCaseType()).append("\n");
        report.append("- Status: ").append(caseEntity.getStatus()).append("\n");
        report.append("- Priority: ").append(caseEntity.getPriority()).append("/10\n");
        report.append("- Filing Date: ").append(caseEntity.getFilingDate()).append("\n");

        if (caseEntity.getHearingDate() != null) {
            report.append("- Hearing Date: ").append(caseEntity.getHearingDate()).append("\n");
        }

        if (caseEntity.getAssignedJudge() != null) {
            report.append("- Assigned Judge: ").append(caseEntity.getAssignedJudge().getFirstName())
                  .append(" ").append(caseEntity.getAssignedJudge().getLastName()).append("\n");
        }

        if (caseEntity.getFilingClerk() != null) {
            report.append("- Filing Clerk: ").append(caseEntity.getFilingClerk().getFirstName())
                  .append(" ").append(caseEntity.getFilingClerk().getLastName()).append("\n");
        }

        if (caseEntity.getDescription() != null && !caseEntity.getDescription().trim().isEmpty()) {
            report.append("\nDescription:\n").append(caseEntity.getDescription()).append("\n");
        }

        if (caseEntity.getNotes() != null && !caseEntity.getNotes().trim().isEmpty()) {
            report.append("\nCase Notes:\n").append(caseEntity.getNotes()).append("\n");
        }

        report.append("\nReport Generated: ").append(java.time.LocalDateTime.now()).append("\n");

        return report.toString();
    }

    // Generate case PDF (placeholder - returns formatted text for now)
    public String generateCasePDF(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // For now, return a simple text-based "PDF" representation
        // In a real implementation, you'd use a PDF library like iText or Apache PDFBox
        StringBuilder pdfContent = new StringBuilder();
        pdfContent.append("%PDF-1.4\n");
        pdfContent.append("1 0 obj\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Type /Catalog\n");
        pdfContent.append("/Pages 2 0 R\n");
        pdfContent.append(">>\n");
        pdfContent.append("endobj\n");

        pdfContent.append("2 0 obj\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Type /Pages\n");
        pdfContent.append("/Kids [3 0 R]\n");
        pdfContent.append("/Count 1\n");
        pdfContent.append(">>\n");
        pdfContent.append("endobj\n");

        pdfContent.append("3 0 obj\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Type /Page\n");
        pdfContent.append("/Parent 2 0 R\n");
        pdfContent.append("/MediaBox [0 0 612 792]\n");
        pdfContent.append("/Contents 4 0 R\n");
        pdfContent.append("/Resources << /Font << /F1 5 0 R >> >>\n");
        pdfContent.append(">>\n");
        pdfContent.append("endobj\n");

        pdfContent.append("4 0 obj\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Length ").append(("BT\n/F1 12 Tf\n72 720 Td\n(" + caseEntity.getTitle() + ") Tj\nET\n").length()).append("\n");
        pdfContent.append(">>\n");
        pdfContent.append("stream\n");
        pdfContent.append("BT\n");
        pdfContent.append("/F1 12 Tf\n");
        pdfContent.append("72 720 Td\n");
        pdfContent.append("(").append(caseEntity.getTitle()).append(") Tj\n");
        pdfContent.append("0 -20 Td\n");
        pdfContent.append("(Case Number: ").append(caseEntity.getCaseNumber()).append(") Tj\n");
        pdfContent.append("0 -20 Td\n");
        pdfContent.append("(Status: ").append(caseEntity.getStatus()).append(") Tj\n");
        pdfContent.append("ET\n");
        pdfContent.append("endstream\n");
        pdfContent.append("endobj\n");

        pdfContent.append("5 0 obj\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Type /Font\n");
        pdfContent.append("/Subtype /Type1\n");
        pdfContent.append("/BaseFont /Helvetica\n");
        pdfContent.append(">>\n");
        pdfContent.append("endobj\n");

        pdfContent.append("xref\n");
        pdfContent.append("0 6\n");
        pdfContent.append("0000000000 65535 f \n");
        pdfContent.append("0000000009 00000 n \n");
        pdfContent.append("0000000058 00000 n \n");
        pdfContent.append("0000000115 00000 n \n");
        pdfContent.append("0000000274 00000 n \n");
        pdfContent.append("0000000516 00000 n \n");
        pdfContent.append("trailer\n");
        pdfContent.append("<<\n");
        pdfContent.append("/Size 6\n");
        pdfContent.append("/Root 1 0 R\n");
        pdfContent.append(">>\n");
        pdfContent.append("startxref\n");
        pdfContent.append("581\n");
        pdfContent.append("%%EOF\n");

        return pdfContent.toString();
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

    // Get all cases (for case management - includes all statuses)
    public List<Case> getAllCases() {
        // Use a custom query to avoid Hibernate lazy loading issues
        return caseRepository.findAllCasesWithUsers();
    }

    // Update case notes
    public Case updateCaseNotes(Long caseId, String notes) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setNotes(notes);
        return caseRepository.save(caseEntity);
    }

    // Add sample documents to new cases
    private void addSampleDocuments(Case caseEntity) {
        // Create sample document metadata based on case type
        List<java.util.Map<String, Object>> sampleDocuments = new java.util.ArrayList<>();

        // Base documents for all cases
        sampleDocuments.add(createDocumentMap("case-evidence-001.pdf", "Case Evidence Document", "pdf", 245760, "/sample-documents/case-evidence-001.pdf.html"));
        sampleDocuments.add(createDocumentMap("witness-statement.txt", "Witness Statement", "txt", 5120, "/sample-documents/witness-statement.txt"));

        // Additional documents based on case type
        switch (caseEntity.getCaseType()) {
            case CRIMINAL:
                sampleDocuments.add(createDocumentMap("court-order-2024.docx", "Court Order 2024", "docx", 153600, "/sample-documents/court-order-2024.docx.html"));
                break;
            case CIVIL:
                sampleDocuments.add(createDocumentMap("court-order-2024.docx", "Civil Court Order", "docx", 153600, "/sample-documents/court-order-2024.docx.html"));
                break;
            case FAMILY:
                sampleDocuments.add(createDocumentMap("court-order-2024.docx", "Family Court Order", "docx", 153600, "/sample-documents/court-order-2024.docx.html"));
                break;
            default:
                // For other case types, just use the base documents
                break;
        }

        // Convert to JSON string
        try {
            String documentsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(sampleDocuments);
            caseEntity.setDocuments(documentsJson);
        } catch (Exception e) {
            // If JSON serialization fails, leave documents as null
            caseEntity.setDocuments(null);
        }
    }

    // Helper method to create document map
    private java.util.Map<String, Object> createDocumentMap(String originalFileName, String description, String fileType, long fileSize, String url) {
        java.util.Map<String, Object> doc = new java.util.HashMap<>();
        doc.put("id", java.util.UUID.randomUUID().toString());
        doc.put("originalFileName", originalFileName);
        doc.put("description", description);
        doc.put("fileType", fileType);
        doc.put("fileSize", fileSize);
        doc.put("url", url);
        doc.put("uploadDate", LocalDateTime.now().toString());
        return doc;
    }

    // Populate existing cases with sample documents (for data migration)
    public void populateExistingCasesWithDocuments() {
        List<Case> existingCases = caseRepository.findAll();
        for (Case caseEntity : existingCases) {
            // Only add documents if the case doesn't already have them
            if (caseEntity.getDocuments() == null || caseEntity.getDocuments().trim().isEmpty()) {
                addSampleDocuments(caseEntity);
                caseRepository.save(caseEntity);
            }
        }
    }

    // Get case by ID
    public Optional<Case> getCaseById(Long id) {
        return caseRepository.findById(id);
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
