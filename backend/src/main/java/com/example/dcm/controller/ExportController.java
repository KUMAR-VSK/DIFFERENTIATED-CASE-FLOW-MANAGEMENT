package com.example.dcm.controller;

import com.example.dcm.model.Case;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.service.ExportService;
import com.example.dcm.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Export", description = "Export cases to Excel/PDF")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private CaseRepository caseRepository;

    // Helper method to generate PDF filename with case number
    private String generateCasePDFFilename(Case caseEntity) {
        String caseNumber = caseEntity.getCaseNumber();
        return String.format("%s.pdf", caseNumber);
    }

    /**
     * Export all cases to Excel
     * GET /api/export/cases/excel
     */
    @GetMapping("/cases/excel")
    @Operation(summary = "Export all cases to Excel", description = "Export all cases in the system to an Excel file with timestamp")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Excel file generated successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
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
    @Operation(summary = "Export all cases to PDF", description = "Export all cases in the system to a single PDF document with timestamp")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF file generated successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
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
    @Operation(summary = "Export single case to PDF", description = "Export detailed information for a specific case to PDF with proper filename based on case number")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF file generated successfully"),
        @ApiResponse(responseCode = "404", description = "Case not found"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<byte[]> exportCaseDetailToPDF(
            @Parameter(description = "Case ID", required = true, example = "1") @PathVariable Long id) {
        try {
            Case caseItem = caseRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Case", "id", id));

            byte[] pdfFile = exportService.exportCaseDetailToPDF(caseItem);

            String filename = generateCasePDFFilename(caseItem);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
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
