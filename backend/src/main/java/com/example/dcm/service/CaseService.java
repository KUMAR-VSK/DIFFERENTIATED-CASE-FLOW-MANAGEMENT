package com.example.dcm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseAudit;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseAuditRepository;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.UserRepository;
import com.example.dcm.specification.CaseSpecification;
import com.example.dcm.dto.CaseSearchCriteria;
import com.example.dcm.dto.JudgeWorkloadDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.data.jpa.domain.Specification;

@Service
@Transactional
public class CaseService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseAuditRepository caseAuditRepository;

    @Autowired
    private PriorityEngine priorityEngine;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Create a new case
    public Case createCase(Case caseEntity, String clerkUsername) {
        try {
            // Set default status if not provided
            if (caseEntity.getStatus() == null) {
                caseEntity.setStatus(Case.Status.FILED);
            }

            // Set default court level if not provided (all new cases start at District Court)
            if (caseEntity.getCourtLevel() == null) {
                caseEntity.setCourtLevel(Case.CourtLevel.DISTRICT);
            }

            // Set filing clerk
            Optional<User> clerk = userRepository.findByUsername(clerkUsername);
            if (clerk.isPresent()) {
                caseEntity.setFilingClerk(clerk.get());
            }

            // Calculate initial priority
            int calculatedPriority = priorityEngine.calculatePriority(caseEntity);
            caseEntity.setPriority(calculatedPriority);

            // Generate sequential case number
            generateSequentialCaseNumber(caseEntity);

            // Add sample documents to new cases
            addSampleDocuments(caseEntity);

            Case savedCase = caseRepository.save(caseEntity);

            // Recalculate priorities for all existing cases to maintain relative priority accuracy
            List<Case> allCases = caseRepository.findAll();
            priorityEngine.recalculateAllPriorities(allCases);

            // Save all updated cases
            caseRepository.saveAll(allCases);

            // Create Audit trail
            saveAuditAndBroadcast(new CaseAudit(savedCase, CaseAudit.ActionType.CASE_CREATED, "Case filed as " + savedCase.getCaseNumber()));

            return savedCase;
        } catch (Exception e) {
            // Log the error for debugging
            e.printStackTrace();
            throw new RuntimeException("Failed to create case: " + e.getMessage(), e);
        }
    }

    // Generate sequential case number - FIXED: Only called on successful submission
    private void generateSequentialCaseNumber(Case caseEntity) {
        // Get the highest existing case sequence for the current year
        Integer maxSequence = caseRepository.findMaxCaseSequence();

        // If no cases exist yet, start from 1
        if (maxSequence == null) {
            caseEntity.setCaseSequence(1);
        } else {
            // Increment the highest sequence by 1
            caseEntity.setCaseSequence(maxSequence + 1);
        }

        // Generate the case number format: CASE-YYYY-NNNN
        String year = String.valueOf(java.time.LocalDateTime.now().getYear());
        String baseNumber = String.format("CASE-%s-%04d", year, caseEntity.getCaseSequence());

        // Add court level suffix for escalated cases
        if (caseEntity.getCourtLevel() != null && caseEntity.getCourtLevel() != Case.CourtLevel.DISTRICT) {
            String suffix = switch (caseEntity.getCourtLevel()) {
                case HIGH -> "-HC";
                case SUPREME -> "-SC";
                default -> "";
            };
            baseNumber += suffix;
        }

        caseEntity.setCaseNumber(baseNumber);
    }

    // Update case status
    @CacheEvict(value = "cases", key = "#caseId")
    public Case updateCaseStatus(Long caseId, Case.Status newStatus) {
        return updateCaseStatus(caseId, newStatus, null);
    }

    public Case updateCaseStatus(Long caseId, Case.Status newStatus, String performedByUsername) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        Case.Status oldStatus = caseEntity.getStatus();
        caseEntity.setStatus(newStatus);
        Case savedCase = caseRepository.save(caseEntity);

        CaseAudit audit = new CaseAudit(savedCase, CaseAudit.ActionType.STATUS_CHANGED,
                "Status changed from " + oldStatus + " to " + newStatus);
        if (performedByUsername != null) {
            userRepository.findByUsername(performedByUsername).ifPresent(audit::setPerformedBy);
        }
        saveAuditAndBroadcast(audit);
        return savedCase;
    }

    // Assign judge to case
    @CacheEvict(value = "cases", key = "#caseId")
    public Case assignJudge(Long caseId, Long judgeId) {
        return assignJudge(caseId, judgeId, null);
    }

    public Case assignJudge(Long caseId, Long judgeId, String performedByUsername) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("User is not a judge");
        }

        caseEntity.setAssignedJudge(judge);
        caseEntity.setStatus(Case.Status.SCHEDULED);
        Case savedCase = caseRepository.save(caseEntity);

        CaseAudit audit = new CaseAudit(savedCase, CaseAudit.ActionType.JUDGE_ASSIGNED,
                "Assigned to Judge: " + judge.getFirstName() + " " + judge.getLastName());
        if (performedByUsername != null) {
            userRepository.findByUsername(performedByUsername).ifPresent(audit::setPerformedBy);
        }
        saveAuditAndBroadcast(audit);
        return savedCase;
    }

    // Schedule hearing
    @CacheEvict(value = "cases", key = "#caseId")
    public Case scheduleHearing(Long caseId, LocalDateTime hearingDate) {
        return scheduleHearing(caseId, hearingDate, null);
    }

    public Case scheduleHearing(Long caseId, LocalDateTime hearingDate, String performedByUsername) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setHearingDate(hearingDate);
        if (caseEntity.getStatus() == Case.Status.FILED || caseEntity.getStatus() == Case.Status.UNDER_REVIEW) {
            caseEntity.setStatus(Case.Status.SCHEDULED);
        }
        Case savedCase = caseRepository.save(caseEntity);

        CaseAudit audit = new CaseAudit(savedCase, CaseAudit.ActionType.HEARING_SCHEDULED,
                "Hearing scheduled for " + hearingDate.toString().substring(0, 10));
        if (performedByUsername != null) {
            userRepository.findByUsername(performedByUsername).ifPresent(audit::setPerformedBy);
        }
        saveAuditAndBroadcast(audit);
        return savedCase;
    }

    // Get cases by priority order (for scheduling)
    public List<Case> getCasesByPriorityOrder() {
        return caseRepository.findByStatusOrderByPriorityDescFilingDateAsc(
            List.of(Case.Status.UNDER_REVIEW, Case.Status.SCHEDULED)
        );
    }

    // Get cases by priority order filtered by court level
    public List<Case> getCasesByPriorityOrderAndCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findByStatusInAndCourtLevelOrderByPriorityDescFilingDateAsc(
            List.of(Case.Status.UNDER_REVIEW, Case.Status.SCHEDULED), caseLevel
        );
    }

    // Get unscheduled cases
    public List<Case> getUnscheduledCases() {
        return caseRepository.findUnscheduledCasesOrderByPriority();
    }

    // Get unscheduled cases filtered by court level
    public List<Case> getUnscheduledCasesByCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findUnscheduledCasesOrderByPriorityAndCourtLevel(caseLevel);
    }

    // Get cases assigned to judge
    public List<Case> getCasesByJudge(Long judgeId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        return caseRepository.findByAssignedJudge(judge);
    }

    // Get cases accessible to a judge based on their court level
    public List<Case> getCasesByJudgeCourtLevel(Long judgeId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("User is not a judge");
        }

        // Judges can only see cases at their court level
        if (judge.getCourtLevel() == null) {
            // If no court level set, default to District
            return caseRepository.findByCourtLevel(Case.CourtLevel.DISTRICT);
        }

        // Convert User.CourtLevel to Case.CourtLevel
        Case.CourtLevel caseCourtLevel = convertUserCourtLevelToCaseCourtLevel(judge.getCourtLevel());
        return caseRepository.findByCourtLevel(caseCourtLevel);
    }

    // Check if judge can access a specific case
    public boolean canJudgeAccessCase(Long judgeId, Long caseId) {
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new IllegalArgumentException("Judge not found"));

        if (judge.getRole() != User.Role.JUDGE) {
            return false;
        }

        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Judges can only access cases at their court level
        if (judge.getCourtLevel() == null) {
            return caseEntity.getCourtLevel() == null || caseEntity.getCourtLevel() == Case.CourtLevel.DISTRICT;
        }

        // Convert User.CourtLevel to Case.CourtLevel for comparison
        Case.CourtLevel caseCourtLevel = convertUserCourtLevelToCaseCourtLevel(judge.getCourtLevel());
        return caseEntity.getCourtLevel() == caseCourtLevel;
    }

    // Helper method to convert User.CourtLevel to Case.CourtLevel
    private Case.CourtLevel convertUserCourtLevelToCaseCourtLevel(User.CourtLevel userCourtLevel) {
        if (userCourtLevel == null) {
            return Case.CourtLevel.DISTRICT;
        }
        
        switch (userCourtLevel) {
            case DISTRICT:
                return Case.CourtLevel.DISTRICT;
            case HIGH:
                return Case.CourtLevel.HIGH;
            case SUPREME:
                return Case.CourtLevel.SUPREME;
            default:
                return Case.CourtLevel.DISTRICT;
        }
    }

    // Get high priority cases
    public List<Case> getHighPriorityCases() {
        return caseRepository.findByPriorityGreaterThanEqual(8);
    }

    // Get high priority cases filtered by court level
    public List<Case> getHighPriorityCasesByCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findByPriorityGreaterThanEqualAndCourtLevel(8, caseLevel);
    }

    // Get all scheduled hearings for calendar view
    public List<Case> getAllScheduledHearings() {
        return caseRepository.findAllScheduledHearings();
    }

    // Get all scheduled hearings filtered by court level
    public List<Case> getAllScheduledHearingsByCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findAllScheduledHearingsByCourtLevel(caseLevel);
    }

    // Update case priority
    @CacheEvict(value = "cases", key = "#caseId")
    public Case updatePriority(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Recalculate priority with age consideration
        int newPriority = priorityEngine.adjustPriorityForAge(caseEntity);
        caseEntity.setPriority(newPriority);

        return caseRepository.save(caseEntity);
    }

    // Set manual priority
    @CacheEvict(value = "cases", key = "#caseId")
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

    // Generate case history PDF
    public byte[] generateCasePDF(Long caseId) throws Exception {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        List<CaseAudit> history = caseAuditRepository.findByCaseEntityOrderByCreatedAtAsc(caseEntity);

        com.itextpdf.text.Document document = new com.itextpdf.text.Document(com.itextpdf.text.PageSize.A4);
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();

        try {
            com.itextpdf.text.pdf.PdfWriter writer = com.itextpdf.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            // Set up fonts
            com.itextpdf.text.Font titleFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 22, com.itextpdf.text.BaseColor.DARK_GRAY);
            com.itextpdf.text.Font headerFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 14, com.itextpdf.text.BaseColor.BLACK);
            com.itextpdf.text.Font normalFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA, 12, com.itextpdf.text.BaseColor.BLACK);
            com.itextpdf.text.Font dateFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_OBLIQUE, 10, com.itextpdf.text.BaseColor.GRAY);

            // Add Header
            com.itextpdf.text.Paragraph title = new com.itextpdf.text.Paragraph("Comprehensive Case History Report", titleFont);
            title.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            com.itextpdf.text.pdf.draw.LineSeparator separator = new com.itextpdf.text.pdf.draw.LineSeparator();
            separator.setLineColor(com.itextpdf.text.BaseColor.LIGHT_GRAY);
            document.add(new com.itextpdf.text.Chunk(separator));

            // Case Info Summary
            com.itextpdf.text.Paragraph caseInfo = new com.itextpdf.text.Paragraph();
            caseInfo.setSpacingBefore(15);
            caseInfo.setSpacingAfter(20);
            caseInfo.add(new com.itextpdf.text.Chunk("Case Number: ", headerFont));
            caseInfo.add(new com.itextpdf.text.Chunk(caseEntity.getCaseNumber() + "\n", normalFont));
            caseInfo.add(new com.itextpdf.text.Chunk("Title: ", headerFont));
            caseInfo.add(new com.itextpdf.text.Chunk(caseEntity.getTitle() + "\n", normalFont));
            caseInfo.add(new com.itextpdf.text.Chunk("Status: ", headerFont));
            caseInfo.add(new com.itextpdf.text.Chunk(caseEntity.getStatus().name() + "  |  ", normalFont));
            caseInfo.add(new com.itextpdf.text.Chunk("Court Level: ", headerFont));
            caseInfo.add(new com.itextpdf.text.Chunk(caseEntity.getCourtLevel().name() + "\n", normalFont));
            caseInfo.add(new com.itextpdf.text.Chunk("Filing Date: ", headerFont));
            caseInfo.add(new com.itextpdf.text.Chunk(caseEntity.getFilingDate().toString().substring(0, 10), normalFont));
            document.add(caseInfo);

            document.add(new com.itextpdf.text.Chunk(separator));

            // Timeline Header
            com.itextpdf.text.Paragraph timelineTitle = new com.itextpdf.text.Paragraph("Case Change History (Timeline)", com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 18, com.itextpdf.text.BaseColor.DARK_GRAY));
            timelineTitle.setSpacingBefore(20);
            timelineTitle.setSpacingAfter(15);
            document.add(timelineTitle);

            // Format Timeline
            for (CaseAudit audit : history) {
                com.itextpdf.text.pdf.PdfPTable auditTable = new com.itextpdf.text.pdf.PdfPTable(1);
                auditTable.setWidthPercentage(100);
                
                com.itextpdf.text.pdf.PdfPCell cell = new com.itextpdf.text.pdf.PdfPCell();
                cell.setPadding(10);
                cell.setUseBorderPadding(true);
                cell.setBorderWidth(1);
                cell.setBorderColor(com.itextpdf.text.BaseColor.LIGHT_GRAY);
                cell.setBackgroundColor(new com.itextpdf.text.BaseColor(245, 247, 250)); // Very light blue/gray
                
                // Date portion
                String dateStr = audit.getCreatedAt() != null ? java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy - HH:mm").format(audit.getCreatedAt()) : "Unknown Time";
                com.itextpdf.text.Paragraph dateP = new com.itextpdf.text.Paragraph(dateStr, dateFont);
                dateP.setSpacingAfter(5);
                cell.addElement(dateP);
                
                // Action Type and Description
                com.itextpdf.text.Font actionFont = com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA_BOLD, 12, com.itextpdf.text.BaseColor.BLACK);
                com.itextpdf.text.Paragraph actionP = new com.itextpdf.text.Paragraph(audit.getActionType().name().replace("_", " "), actionFont);
                actionP.setSpacingAfter(3);
                cell.addElement(actionP);
                
                com.itextpdf.text.Paragraph descP = new com.itextpdf.text.Paragraph(audit.getDescription(), normalFont);
                cell.addElement(descP);
                
                auditTable.addCell(cell);
                document.add(auditTable);
                
                // Small spacing between audit entries
                document.add(new com.itextpdf.text.Paragraph(" ", com.itextpdf.text.FontFactory.getFont(com.itextpdf.text.FontFactory.HELVETICA, 5)));
            }
            
            if (history.isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("No history records found for this case.", normalFont));
            }

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    // Get case statistics
    public CaseStatistics getCaseStatistics() {
        return getCaseStatistics(null);
    }

    // Get case statistics with optional court level filter
    public CaseStatistics getCaseStatistics(User.CourtLevel userLevel) {
        List<Case> allCases;
        if (userLevel != null) {
            Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
            allCases = caseRepository.findByCourtLevel(caseLevel);
        } else {
            allCases = caseRepository.findAll();
        }

        long totalCases = allCases.size();
        long filedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.FILED ? 1 : 0).sum();
        long scheduledCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.SCHEDULED ? 1 : 0).sum();
        long completedCases = allCases.stream().mapToLong(c -> c.getStatus() == Case.Status.COMPLETED ? 1 : 0).sum();

        double avgPriority = allCases.stream().mapToInt(Case::getPriority).average().orElse(0.0);

        // Initialize maps with all possible enum values
        java.util.Map<String, Long> statusDistribution = new java.util.HashMap<>();
        for (Case.Status s : Case.Status.values()) statusDistribution.put(s.name(), 0L);
        
        java.util.Map<String, Long> typeDistribution = new java.util.HashMap<>();
        for (Case.CaseType t : Case.CaseType.values()) typeDistribution.put(t.name(), 0L);

        // Fill with actual data
        allCases.forEach(c -> {
            String status = c.getStatus().name();
            String type = c.getCaseType().name();
            statusDistribution.put(status, statusDistribution.getOrDefault(status, 0L) + 1);
            typeDistribution.put(type, typeDistribution.getOrDefault(type, 0L) + 1);
        });

        return new CaseStatistics(totalCases, filedCases, scheduledCases, completedCases, avgPriority, statusDistribution, typeDistribution);
    }

    // Get all cases (for case management - includes all statuses)
    public List<Case> getAllCases() {
        // Use a custom query to avoid Hibernate lazy loading issues
        return caseRepository.findAllCasesWithUsers();
    }

    // Get all cases paginated
    public Page<Case> getAllCasesPaged(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return caseRepository.findAllCasesWithUsersPaged(pageable);
    }

    // Get all cases filtered by court level paginated
    public Page<Case> getAllCasesByCourtLevelPaged(User.CourtLevel userLevel, int page, int size, String sortBy, String direction) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return caseRepository.findAllCasesWithUsersByCourtLevelPaged(caseLevel, pageable);
    }

    // Get all cases filtered by court level
    public List<Case> getAllCasesByCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findAllCasesWithUsersByCourtLevel(caseLevel);
    }

    // Update case notes
    public Case updateCaseNotes(Long caseId, String notes) {
        return updateCaseNotes(caseId, notes, null);
    }

    public Case updateCaseNotes(Long caseId, String notes, String performedByUsername) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        String oldNotes = caseEntity.getNotes() != null ? caseEntity.getNotes() : "";
        caseEntity.setNotes(notes);
        Case savedCase = caseRepository.save(caseEntity);

        // Extract what was newly added
        String newText = notes != null ? notes : "";
        String addedText = newText.length() > oldNotes.length()
                ? newText.substring(oldNotes.length()).trim()
                : "(note updated)";
        String shortPreview = addedText.length() > 120 ? addedText.substring(0, 117) + "..." : addedText;

        CaseAudit audit = new CaseAudit(savedCase, CaseAudit.ActionType.NOTE_ADDED,
                "Note added: " + shortPreview);
        if (performedByUsername != null) {
            userRepository.findByUsername(performedByUsername).ifPresent(audit::setPerformedBy);
        }
        saveAuditAndBroadcast(audit);
        return savedCase;
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
    @Cacheable(value = "cases", key = "#id")
    public Optional<Case> getCaseById(Long id) {
        return caseRepository.findById(id);
    }

    // Get recent cases (sorted by creation date, descending)
    public List<Case> getRecentCases() {
        return caseRepository.findTop5ByOrderByFilingDateDesc();
    }

    // Get recent cases filtered by court level
    public List<Case> getRecentCasesByCourtLevel(User.CourtLevel userLevel) {
        Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
        return caseRepository.findTop5ByCourtLevelOrderByFilingDateDesc(caseLevel);
    }

    // Get next case number preview (for filing form)
    public String getNextCaseNumberPreview() {
        // Get the highest existing case sequence
        Integer maxSequence = caseRepository.findMaxCaseSequence();
        
        // Calculate next sequence number
        int nextSequence = (maxSequence == null) ? 1 : maxSequence + 1;
        
        // Generate the preview case number format: CASE-YYYY-NNNN
        String year = String.valueOf(java.time.LocalDateTime.now().getYear());
        return String.format("CASE-%s-%04d", year, nextSequence);
    }


    // ========== COURT ESCALATION METHODS ==========

    /**
     * Check if a case qualifies for escalation
     */
    public boolean checkEscalationConditions(Case caseEntity) {
        // Condition 1: Judge marks as unresolved (status = UNRESOLVED - need to add this status)
        // For now, we'll use DISMISSED status as a trigger for appeal
        if (caseEntity.getStatus() == Case.Status.DISMISSED) {
            return true;
        }

        // Condition 2: Case exceeds maximum allowed resolution time
        if (caseEntity.getEstimatedDurationDays() != null && caseEntity.getFilingDate() != null) {
            LocalDateTime maxResolutionDate = caseEntity.getFilingDate()
                    .plusDays(caseEntity.getEstimatedDurationDays() * 2L); // Double as buffer
            if (LocalDateTime.now().isAfter(maxResolutionDate)) {
                return true;
            }
        }

        // Condition 3: Manual escalation flag (could be added)
        // For now, return false as this needs frontend support
        return false;
    }

    /**
     * Check if a case can be escalated to Supreme Court specifically
     * This method provides specific validation for High Court to Supreme Court escalation
     */
    public boolean canEscalateToSupremeCourt(Case caseEntity) {
        // Must be at High Court level currently
        if (caseEntity.getCourtLevel() != Case.CourtLevel.HIGH) {
            return false;
        }

        // Must have been resolved at High Court level (not already escalated)
        if (caseEntity.getStatus() == Case.Status.ESCALATED) {
            return false;
        }

        // Must meet one of the escalation criteria
        return checkEscalationConditions(caseEntity);
    }

    /**
     * Get escalation eligibility details for a specific case
     * Provides detailed information about why a case can or cannot be escalated
     */
    public EscalationEligibility getEscalationEligibility(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        EscalationEligibility eligibility = new EscalationEligibility();
        eligibility.setCaseId(caseId);
        eligibility.setCurrentCourtLevel(caseEntity.getCourtLevel());
        eligibility.setCurrentStatus(caseEntity.getStatus());
        eligibility.setCanEscalate(!caseEntity.getCourtLevel().isFinalLevel());

        // Check specific Supreme Court escalation eligibility
        if (caseEntity.getCourtLevel() == Case.CourtLevel.HIGH) {
            eligibility.setCanEscalateToSupremeCourt(canEscalateToSupremeCourt(caseEntity));
        } else {
            eligibility.setCanEscalateToSupremeCourt(false);
        }

        // Check escalation reasons
        if (caseEntity.getStatus() == Case.Status.DISMISSED) {
            eligibility.getEligibilityReasons().add("Case was dismissed - eligible for appeal");
        }

        if (caseEntity.getEstimatedDurationDays() != null && caseEntity.getFilingDate() != null) {
            LocalDateTime maxResolutionDate = caseEntity.getFilingDate()
                    .plusDays(caseEntity.getEstimatedDurationDays() * 2L);
            if (LocalDateTime.now().isAfter(maxResolutionDate)) {
                eligibility.getEligibilityReasons().add("Case exceeded maximum resolution time");
            }
        }

        return eligibility;
    }

    /**
     * Escalate a case to the next court level
     */
    public Case escalateCase(Long caseId, String reason) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        Case.CourtLevel currentLevel = caseEntity.getCourtLevel();
        if (currentLevel == null) {
            currentLevel = Case.CourtLevel.DISTRICT;
        }

        // Check if can escalate further
        if (currentLevel.isFinalLevel()) {
            throw new IllegalStateException("Case is already at the highest court level (Supreme Court)");
        }

        // Get next court level
        Case.CourtLevel nextLevel = currentLevel.getNextLevel();
        if (nextLevel == null) {
            throw new IllegalStateException("Cannot escalate beyond Supreme Court");
        }

        // Update case with new court level
        caseEntity.setCourtLevel(nextLevel);
        caseEntity.setEscalationReason(reason);
        caseEntity.setEscalationDate(LocalDateTime.now());
        caseEntity.setStatus(Case.Status.ESCALATED);

        // Apply priority multiplier for higher court (increase by 2 points, max 10)
        int newPriority = Math.min(caseEntity.getPriority() + 2, 10);
        caseEntity.setPriority(newPriority);

        // Generate new case number with court level suffix
        generateSequentialCaseNumber(caseEntity);

        // Clear assigned judge (new court will assign their own judge)
        caseEntity.setAssignedJudge(null);

        Case savedCase = caseRepository.save(caseEntity);

        // Save escalation audit entry
        CaseAudit audit = new CaseAudit(savedCase, CaseAudit.ActionType.COURT_ESCALATED,
                "Case escalated from " + currentLevel.getDisplayName() + " to " + nextLevel.getDisplayName()
                + ". Reason: " + reason);
        audit.setPreviousCourtLevel(currentLevel);
        audit.setNewCourtLevel(nextLevel);
        saveAuditAndBroadcast(audit);

        return savedCase;
    }

    /**
     * De-escalate a case to a lower court level (e.g., Supreme Court to High Court)
     */
    public Case deescalateCase(Long caseId, String reason) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        Case.CourtLevel currentLevel = caseEntity.getCourtLevel();
        
        // Check if case has a court level set
        if (currentLevel == null) {
            throw new IllegalStateException("Case does not have a court level assigned");
        }

        // Check if can de-escalate
        Case.CourtLevel previousLevel = currentLevel.getPreviousLevel();
        if (previousLevel == null) {
            throw new IllegalStateException("Case is already at the lowest court level (District). Current level: " + currentLevel);
        }

        // De-escalate to previous level
        caseEntity.setCourtLevel(previousLevel);
        caseEntity.setEscalationReason("De-escalated: " + reason);
        caseEntity.setEscalationDate(LocalDateTime.now());
        
        // If back to District, reset status to FILED, otherwise keep as ESCALATED or similar?
        // Let's keep status as ESCALATED but maybe add a note, or if it goes back to District, maybe FILED/IN_PROGRESS.
        // The prompt implies hierarchical movement.
        // Existing logic set it to FILED if de-escalated. 
        // If moving Supreme -> High, it is still technically an escalated case from District perspective, 
        // but let's keep it simple: Status remains active or resets.
        // Let's set to IN_PROGRESS if High Court, FILED if District.
        if (previousLevel == Case.CourtLevel.DISTRICT) {
            caseEntity.setStatus(Case.Status.FILED); // Reset to base state
        } else {
            // Moving to High Court, keep as ESCALATED or IN_PROGRESS
            caseEntity.setStatus(Case.Status.ESCALATED);
        }

        // Decrease priority (decrease by 2 points, minimum 1)
        int newPriority = Math.max(caseEntity.getPriority() - 2, 1);
        caseEntity.setPriority(newPriority);

        // Generate new case number with correct suffix
        generateSequentialCaseNumber(caseEntity);

        // Clear assigned judge (new court will assign their own judge)
        caseEntity.setAssignedJudge(null);

        return caseRepository.save(caseEntity);
    }

    /**
     * Get previous court level for de-escalation
     */
    public Case.CourtLevel getPreviousCourtLevel(Case.CourtLevel currentLevel) {
        if (currentLevel == null) {
            return null;
        }

        return switch (currentLevel) {
            case SUPREME -> Case.CourtLevel.HIGH;
            case HIGH -> Case.CourtLevel.DISTRICT;
            case DISTRICT -> null; // District is the lowest level
        };
    }

    /**
     * Check if a case can be de-escalated
     */
    public boolean canDeescalateCase(Case caseEntity) {
        // Can de-escalate if there is a previous level (i.e., not District)
        return caseEntity.getCourtLevel() != null && caseEntity.getCourtLevel().getPreviousLevel() != null;
    }

    /**
     * Get de-escalation eligibility details for a specific case
     */
    public DeescalationEligibility getDeescalationEligibility(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        DeescalationEligibility eligibility = new DeescalationEligibility();
        eligibility.setCaseId(caseId);
        eligibility.setCurrentCourtLevel(caseEntity.getCourtLevel());
        eligibility.setCurrentStatus(caseEntity.getStatus());
        eligibility.setCanDeescalate(canDeescalateCase(caseEntity));

        // Check de-escalation reasons
        if (caseEntity.getCourtLevel() != null && caseEntity.getCourtLevel().getPreviousLevel() != null) {
            if (caseEntity.getCourtLevel() == Case.CourtLevel.SUPREME) {
                eligibility.getEligibilityReasons().add("Case is at Supreme Court level - eligible for de-escalation to High Court");
            } else if (caseEntity.getCourtLevel() == Case.CourtLevel.HIGH) {
                eligibility.getEligibilityReasons().add("Case is at High Court level - eligible for de-escalation to District Court");
            }
        }

        return eligibility;
    }

    /**
     * Get cases by court level
     */
    public List<Case> getCasesByCourtLevel(Case.CourtLevel courtLevel) {
        return caseRepository.findByCourtLevel(courtLevel);
    }

    /**
     * Get all escalated cases
     */
    public List<Case> getEscalatedCases() {
        return caseRepository.findByStatus(Case.Status.ESCALATED);
    }

    /**
     * Get cases eligible for escalation
     */
    public List<Case> getCasesEligibleForEscalation() {
        return caseRepository.findAll().stream()
                .filter(c -> c.getCourtLevel() != Case.CourtLevel.SUPREME)
                .filter(this::checkEscalationConditions)
                .toList();
    }

    /**
     * Get court level distribution statistics
     */
    public CourtLevelStats getCourtLevelStats() {
        return getCourtLevelStats(null);
    }

    /**
     * Get court level distribution statistics with optional court level filter
     */
    public CourtLevelStats getCourtLevelStats(User.CourtLevel userLevel) {
        List<Case> allCases;
        if (userLevel != null) {
            Case.CourtLevel caseLevel = convertUserCourtLevelToCaseCourtLevel(userLevel);
            allCases = caseRepository.findByCourtLevel(caseLevel);
        } else {
            allCases = caseRepository.findAll();
        }
        
        long districtCases = allCases.stream()
                .filter(c -> c.getCourtLevel() == null || c.getCourtLevel() == Case.CourtLevel.DISTRICT)
                .count();
        
        long highCourtCases = allCases.stream()
                .filter(c -> c.getCourtLevel() == Case.CourtLevel.HIGH)
                .count();
        
        long supremeCourtCases = allCases.stream()
                .filter(c -> c.getCourtLevel() == Case.CourtLevel.SUPREME)
                .count();
        
        long escalatedCases = allCases.stream()
                .filter(c -> c.getStatus() == Case.Status.ESCALATED)
                .count();
        
        long escalationEligible = allCases.stream()
                .filter(c -> c.getCourtLevel() != Case.CourtLevel.SUPREME)
                .filter(this::checkEscalationConditions)
                .count();

        return new CourtLevelStats(districtCases, highCourtCases, supremeCourtCases, escalatedCases, escalationEligible);
    }

    // Inner class for court level statistics
    public static class CourtLevelStats {
        private final long districtCourtCases;
        private final long highCourtCases;
        private final long supremeCourtCases;
        private final long escalatedCases;
        private final long escalationEligible;

        public CourtLevelStats(long districtCourtCases, long highCourtCases, long supremeCourtCases, 
                              long escalatedCases, long escalationEligible) {
            this.districtCourtCases = districtCourtCases;
            this.highCourtCases = highCourtCases;
            this.supremeCourtCases = supremeCourtCases;
            this.escalatedCases = escalatedCases;
            this.escalationEligible = escalationEligible;
        }

        // Getters
        public long getDistrictCourtCases() { return districtCourtCases; }
        public long getHighCourtCases() { return highCourtCases; }
        public long getSupremeCourtCases() { return supremeCourtCases; }
        public long getEscalatedCases() { return escalatedCases; }
        public long getEscalationEligible() { return escalationEligible; }
    }

    // Inner class for statistics
    public static class CaseStatistics {
        private final long totalCases;
        private final long filedCases;
        private final long scheduledCases;
        private final long completedCases;
        private final double averagePriority;
        private final java.util.Map<String, Long> statusDistribution;
        private final java.util.Map<String, Long> typeDistribution;

        public CaseStatistics(long totalCases, long filedCases, long scheduledCases, long completedCases, double averagePriority,
                              java.util.Map<String, Long> statusDistribution, java.util.Map<String, Long> typeDistribution) {
            this.totalCases = totalCases;
            this.filedCases = filedCases;
            this.scheduledCases = scheduledCases;
            this.completedCases = completedCases;
            this.averagePriority = averagePriority;
            this.statusDistribution = statusDistribution;
            this.typeDistribution = typeDistribution;
        }

        // Getters
        public long getTotalCases() { return totalCases; }
        public long getFiledCases() { return filedCases; }
        public long getScheduledCases() { return scheduledCases; }
        public long getCompletedCases() { return completedCases; }
        public double getAveragePriority() { return averagePriority; }
        public java.util.Map<String, Long> getStatusDistribution() { return statusDistribution; }
        public java.util.Map<String, Long> getTypeDistribution() { return typeDistribution; }
    }

    // Inner class for escalation eligibility
    public static class EscalationEligibility {
        private Long caseId;
        private Case.CourtLevel currentCourtLevel;
        private Case.Status currentStatus;
        private boolean canEscalate;
        private boolean canEscalateToSupremeCourt;
        private List<String> eligibilityReasons = new java.util.ArrayList<>();

        // Getters and Setters
        public Long getCaseId() { return caseId; }
        public void setCaseId(Long caseId) { this.caseId = caseId; }

        public Case.CourtLevel getCurrentCourtLevel() { return currentCourtLevel; }
        public void setCurrentCourtLevel(Case.CourtLevel currentCourtLevel) { this.currentCourtLevel = currentCourtLevel; }

        public Case.Status getCurrentStatus() { return currentStatus; }
        public void setCurrentStatus(Case.Status currentStatus) { this.currentStatus = currentStatus; }

        public boolean isCanEscalate() { return canEscalate; }
        public void setCanEscalate(boolean canEscalate) { this.canEscalate = canEscalate; }

        public boolean isCanEscalateToSupremeCourt() { return canEscalateToSupremeCourt; }
        public void setCanEscalateToSupremeCourt(boolean canEscalateToSupremeCourt) { this.canEscalateToSupremeCourt = canEscalateToSupremeCourt; }

        public List<String> getEligibilityReasons() { return eligibilityReasons; }
        public void setEligibilityReasons(List<String> eligibilityReasons) { this.eligibilityReasons = eligibilityReasons; }
    }

    // Inner class for de-escalation eligibility
    public static class DeescalationEligibility {
        private Long caseId;
        private Case.CourtLevel currentCourtLevel;
        private Case.Status currentStatus;
        private boolean canDeescalate;
        private List<String> eligibilityReasons = new java.util.ArrayList<>();

        // Getters and Setters
        public Long getCaseId() { return caseId; }
        public void setCaseId(Long caseId) { this.caseId = caseId; }

        public Case.CourtLevel getCurrentCourtLevel() { return currentCourtLevel; }
        public void setCurrentCourtLevel(Case.CourtLevel currentCourtLevel) { this.currentCourtLevel = currentCourtLevel; }

        public Case.Status getCurrentStatus() { return currentStatus; }
        public void setCurrentStatus(Case.Status currentStatus) { this.currentStatus = currentStatus; }

        public boolean isCanDeescalate() { return canDeescalate; }
        public void setCanDeescalate(boolean canDeescalate) { this.canDeescalate = canDeescalate; }

        public List<String> getEligibilityReasons() { return eligibilityReasons; }
        public void setEligibilityReasons(List<String> eligibilityReasons) { this.eligibilityReasons = eligibilityReasons; }
    }

    // ========== PRIORITY AGING SERVICE METHODS ==========

    /**
     * Manually recalculate priorities for all active cases
     * Applies the Dynamic Priority Aging formula to all cases
     */
    public int recalculateAllCasePriorities() {
        List<Case> allCases = caseRepository.findAll();
        int updatedCount = 0;

        for (Case caseEntity : allCases) {
            // Skip completed and dismissed cases
            if (caseEntity.getStatus() != Case.Status.COMPLETED &&
                caseEntity.getStatus() != Case.Status.DISMISSED) {
                
                // Recalculate base priority
                int basePriority = priorityEngine.calculatePriority(caseEntity);
                caseEntity.setPriority(basePriority);
                
                // Apply aging adjustment
                int adjustedPriority = priorityEngine.adjustPriorityForAge(caseEntity);
                caseEntity.setPriority(adjustedPriority);
                
                updatedCount++;
            }
        }

        // Save all updated cases
        caseRepository.saveAll(allCases);
        
        return updatedCount;
    }

    /**
     * Get detailed priority aging information for a specific case
     */
    public Map<String, Object> getCasePriorityAgingInfo(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        // Calculate base priority (without aging)
        int basePriority = priorityEngine.calculatePriority(caseEntity);
        
        // Get aging boost
        int agingBoost = priorityEngine.getAgingBoost(caseEntity);
        
        // Get case age
        long caseAgeDays = priorityEngine.getCaseAgeDays(caseEntity);
        
        // Calculate adjusted priority
        int adjustedPriority = priorityEngine.adjustPriorityForAge(caseEntity);
        
        // Build response
        Map<String, Object> agingInfo = new java.util.HashMap<>();
        agingInfo.put("caseId", caseId);
        agingInfo.put("caseNumber", caseEntity.getCaseNumber());
        agingInfo.put("filingDate", caseEntity.getFilingDate());
        agingInfo.put("caseAgeDays", caseAgeDays);
        agingInfo.put("basePriority", basePriority);
        agingInfo.put("agingBoost", agingBoost);
        agingInfo.put("adjustedPriority", adjustedPriority);
        agingInfo.put("currentPriority", caseEntity.getPriority());
        agingInfo.put("status", caseEntity.getStatus());
        agingInfo.put("agingFormula", "Priority += floor(DaysSinceFiling / 30)");
        agingInfo.put("nextAgingBoostIn", 30 - (caseAgeDays % 30));
        
        return agingInfo;
    }

    // ========== UTILITY METHODS ==========

    /**
     * Search cases using dynamic criteria (Specification) - paginated
     */
    public Page<Case> searchCases(CaseSearchCriteria criteria, Pageable pageable) {
        Specification<Case> spec = CaseSpecification.searchByCriteria(criteria);
        return caseRepository.findAll(spec, pageable);
    }

    /**
     * Get judge workload statistics for recommendation logic
     */
    public List<JudgeWorkloadDTO> getJudgeWorkloads(User.CourtLevel level) {
        List<User> judges = userRepository.findByRoleAndCourtLevel(User.Role.JUDGE, level);
        List<JudgeWorkloadDTO> workloadList = new java.util.ArrayList<>();

        for (User judge : judges) {
            List<Case> activeCases = caseRepository.findByAssignedJudge(judge).stream()
                    .filter(c -> c.getStatus() != Case.Status.COMPLETED && c.getStatus() != Case.Status.DISMISSED)
                    .toList();
            
            long count = activeCases.size();
            long totalPriority = activeCases.stream().mapToLong(Case::getPriority).sum();
            
            workloadList.add(new JudgeWorkloadDTO(judge, count, totalPriority));
        }

        // Sort by workload score (ascending, lower is better)
        workloadList.sort(java.util.Comparator.comparingDouble(JudgeWorkloadDTO::getWorkloadScore));

        // Mark top 3 as recommended
        for (int i = 0; i < Math.min(3, workloadList.size()); i++) {
            workloadList.get(i).setRecommended(true);
        }

        return workloadList;
    }

    /**
     * Get user by username (for controller-level auth checks)
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    // ========== ADVOCATE METHODS ==========

    /**
     * Assign an advocate to a case (Admin only)
     */
    public Case assignAdvocate(Long caseId, Long advocateId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        User advocate = userRepository.findById(advocateId)
                .orElseThrow(() -> new IllegalArgumentException("Advocate not found"));

        if (advocate.getRole() != User.Role.ADVOCATE) {
            throw new IllegalArgumentException("User is not an advocate");
        }

        caseEntity.setAssignedAdvocate(advocate);
        return caseRepository.save(caseEntity);
    }

    /**
     * Remove advocate from a case (Admin only)
     */
    public Case removeAdvocate(Long caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseEntity.setAssignedAdvocate(null);
        return caseRepository.save(caseEntity);
    }

    /**
     * Get all cases assigned to an advocate (only their cases)
     */
    public List<Case> getCasesByAdvocate(Long advocateId) {
        User advocate = userRepository.findById(advocateId)
                .orElseThrow(() -> new IllegalArgumentException("Advocate not found"));

        if (advocate.getRole() != User.Role.ADVOCATE) {
            throw new IllegalArgumentException("User is not an advocate");
        }

        return caseRepository.findByAssignedAdvocateWithUsers(advocate);
    }

    /**
     * Check if an advocate can access a specific case
     */
    public boolean canAdvocateAccessCase(Long advocateId, Long caseId) {
        User advocate = userRepository.findById(advocateId)
                .orElseThrow(() -> new IllegalArgumentException("Advocate not found"));

        if (advocate.getRole() != User.Role.ADVOCATE) {
            return false;
        }

        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        return caseEntity.getAssignedAdvocate() != null &&
               caseEntity.getAssignedAdvocate().getId().equals(advocateId);
    }

    private void saveAuditAndBroadcast(CaseAudit audit) {
        CaseAudit saved = caseAuditRepository.save(audit);
        messagingTemplate.convertAndSend("/topic/audits", saved);
    }
}
