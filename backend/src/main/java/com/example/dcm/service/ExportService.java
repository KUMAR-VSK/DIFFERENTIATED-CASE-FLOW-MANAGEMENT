package com.example.dcm.service;

import com.example.dcm.model.Case;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Export cases to Excel (XLSX format)
     */
    public byte[] exportCasesToExcel(List<Case> cases) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cases");

            // Create header row with styling
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            String[] columns = {
                "Case Number", "Title", "Case Type", "Status", "Court Level",
                "Priority", "Filing Date", "Hearing Date", "Assigned Judge"
            };

            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000); // Set width
            }

            // Create data rows
            int rowNum = 1;
            for (Case caseItem : cases) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(caseItem.getCaseNumber());
                row.createCell(1).setCellValue(caseItem.getTitle());
                row.createCell(2).setCellValue(caseItem.getCaseType().toString());
                row.createCell(3).setCellValue(caseItem.getStatus().toString());
                row.createCell(4).setCellValue(caseItem.getCourtLevel().getDisplayName());
                row.createCell(5).setCellValue(caseItem.getPriority());
                row.createCell(6).setCellValue(caseItem.getFilingDate().format(DATE_FORMATTER));
                row.createCell(7).setCellValue(
                    caseItem.getHearingDate() != null 
                        ? caseItem.getHearingDate().format(DATE_FORMATTER) 
                        : "Not Scheduled"
                );
                row.createCell(8).setCellValue(
                    caseItem.getAssignedJudge() != null 
                        ? caseItem.getAssignedJudge().getUsername() 
                        : "Unassigned"
                );
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export cases to PDF
     */
    public byte[] exportCasesToPDF(List<Case> cases) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4.rotate()); // Landscape for better table fit
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Add title
            com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
            Paragraph title = new Paragraph("Case Management Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add generation date
            com.itextpdf.text.Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            Paragraph date = new Paragraph("Generated: " + java.time.LocalDateTime.now().format(DATE_FORMATTER), dateFont);
            date.setAlignment(Element.ALIGN_RIGHT);
            date.setSpacingAfter(10);
            document.add(date);

            // Create table
            PdfPTable table = new PdfPTable(9); // 9 columns
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Set column widths
            float[] columnWidths = {1.2f, 2f, 1f, 1.2f, 1.2f, 0.7f, 1.5f, 1.5f, 1.2f};
            table.setWidths(columnWidths);

            // Add header cells
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            String[] headers = {
                "Case Number", "Title", "Type", "Status", "Court Level",
                "Priority", "Filing Date", "Hearing Date", "Judge"
            };

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            // Add data rows
            com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            for (Case caseItem : cases) {
                table.addCell(new Phrase(caseItem.getCaseNumber(), dataFont));
                table.addCell(new Phrase(truncate(caseItem.getTitle(), 40), dataFont));
                table.addCell(new Phrase(caseItem.getCaseType().toString(), dataFont));
                table.addCell(new Phrase(caseItem.getStatus().toString(), dataFont));
                table.addCell(new Phrase(caseItem.getCourtLevel().name(), dataFont));
                table.addCell(new Phrase(String.valueOf(caseItem.getPriority()), dataFont));
                table.addCell(new Phrase(caseItem.getFilingDate().format(DATE_FORMATTER), dataFont));
                table.addCell(new Phrase(
                    caseItem.getHearingDate() != null 
                        ? caseItem.getHearingDate().format(DATE_FORMATTER) 
                        : "Not Scheduled", 
                    dataFont
                ));
                table.addCell(new Phrase(
                    caseItem.getAssignedJudge() != null 
                        ? caseItem.getAssignedJudge().getUsername() 
                        : "Unassigned", 
                    dataFont
                ));
            }

            document.add(table);

            // Add summary
            document.add(new Paragraph("\n"));
            com.itextpdf.text.Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            document.add(new Paragraph("Total Cases: " + cases.size(), summaryFont));

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    /**
     * Export single case details to PDF
     */
    public byte[] exportCaseDetailToPDF(Case caseItem) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
            Paragraph title = new Paragraph("Case Details Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Case number
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            com.itextpdf.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("Case Number: " + caseItem.getCaseNumber(), headerFont));
            document.add(new Paragraph(" ", normalFont)); // Spacing

            // Details
            addLabelValue(document, "Title", caseItem.getTitle());
            addLabelValue(document, "Case Type", caseItem.getCaseType().toString());
            addLabelValue(document, "Status", caseItem.getStatus().toString());
            addLabelValue(document, "Court Level", caseItem.getCourtLevel().getDisplayName());
            addLabelValue(document, "Priority", String.valueOf(caseItem.getPriority()));
            addLabelValue(document, "Filing Date", caseItem.getFilingDate().format(DATE_FORMATTER));
            addLabelValue(document, "Hearing Date", 
                caseItem.getHearingDate() != null 
                    ? caseItem.getHearingDate().format(DATE_FORMATTER) 
                    : "Not Scheduled");
            addLabelValue(document, "Assigned Judge", 
                caseItem.getAssignedJudge() != null 
                    ? caseItem.getAssignedJudge().getUsername() 
                    : "Unassigned");

            if (caseItem.getDescription() != null && !caseItem.getDescription().isEmpty()) {
                document.add(new Paragraph(" ", normalFont));
                document.add(new Paragraph("Description:", headerFont));
                document.add(new Paragraph(caseItem.getDescription(), normalFont));
            }

            if (caseItem.getNotes() != null && !caseItem.getNotes().isEmpty()) {
                document.add(new Paragraph(" ", normalFont));
                document.add(new Paragraph("Notes:", headerFont));
                document.add(new Paragraph(caseItem.getNotes(), normalFont));
            }

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    private void addLabelValue(Document document, String label, String value) throws DocumentException {
        com.itextpdf.text.Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        com.itextpdf.text.Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + ": ", labelFont));
        p.add(new Chunk(value, valueFont));
        p.setSpacingAfter(5);
        document.add(p);
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
