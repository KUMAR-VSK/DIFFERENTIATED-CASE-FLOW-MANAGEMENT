package com.example.dcm.controller;

import com.example.dcm.model.Case;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.service.ExportService;
import com.example.dcm.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "*")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private CaseRepository caseRepository;

    /**
     * Export all cases to Excel
     * GET /api/export/cases/excel
     */
    @GetMapping("/cases/excel")
    public ResponseEntity<byte[]> exportCasesToExcel() {
        try {
            List<Case> cases = caseRepository.findAll();
            byte[] excelFile = exportService.exportCasesToExcel(cases);

            String filename = "cases_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelFile);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting cases to Excel: " + e.getMessage(), e);
        }
    }

    /**
     * Export all cases to PDF
     * GET /api/export/cases/pdf
     */
    @GetMapping("/cases/pdf")
    public ResponseEntity<byte[]> exportCasesToPDF() {
        try {
            List<Case> cases = caseRepository.findAll();
            byte[] pdfFile = exportService.exportCasesToPDF(cases);

            String filename = "cases_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfFile);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting cases to PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Export single case details to PDF
     * GET /api/export/case/{id}/pdf
     */
    @GetMapping("/case/{id}/pdf")
    public ResponseEntity<byte[]> exportCaseDetailToPDF(@PathVariable Long id) {
        try {
            Case caseItem = caseRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Case", "id", id));
            
            byte[] pdfFile = exportService.exportCaseDetailToPDF(caseItem);

            String filename = caseItem.getCaseNumber() + "_details.pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfFile);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting case details to PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Export filtered cases to Excel
     * POST /api/export/cases/excel/filtered
     */
    @PostMapping("/cases/excel/filtered")
    public ResponseEntity<byte[]> exportFilteredCasesToExcel(@RequestBody List<Long> caseIds) {
        try {
            List<Case> cases = caseRepository.findAllById(caseIds);
            byte[] excelFile = exportService.exportCasesToExcel(cases);

            String filename = "filtered_cases_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelFile);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting filtered cases to Excel: " + e.getMessage(), e);
        }
    }

    /**
     * Export filtered cases to PDF
     * POST /api/export/cases/pdf/filtered
     */
    @PostMapping("/cases/pdf/filtered")
    public ResponseEntity<byte[]> exportFilteredCasesToPDF(@RequestBody List<Long> caseIds) {
        try {
            List<Case> cases = caseRepository.findAllById(caseIds);
            byte[] pdfFile = exportService.exportCasesToPDF(cases);

            String filename = "filtered_cases_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfFile);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting filtered cases to PDF: " + e.getMessage(), e);
        }
    }
}
