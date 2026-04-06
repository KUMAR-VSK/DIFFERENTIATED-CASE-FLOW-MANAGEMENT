package com.example.dcm.service;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseAudit;
import com.example.dcm.repository.CaseAuditRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Autowired
    private CaseAuditRepository caseAuditRepository;

    /**
     * Helper class for page numbering
     */
    private class PageNumberEvents extends com.itextpdf.text.pdf.PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(1);
            table.setTotalWidth(523);
            table.setLockedWidth(true);
            table.getDefaultCell().setFixedHeight(20);
            table.getDefaultCell().setBorder(com.itextpdf.text.Rectangle.TOP);
            table.getDefaultCell().setHorizontalAlignment(com.itextpdf.text.Element.ALIGN_RIGHT);
            
            Font footerFt = FontFactory.getFont(FontFactory.HELVETICA, 8, new BaseColor(120, 120, 130));
            table.addCell(new com.itextpdf.text.Phrase(String.format("Page %d", writer.getPageNumber()), footerFt));
            
            table.writeSelectedRows(0, -1, 36, 30, writer.getDirectContent());
        }
    }

    /**
     * Export cases to Excel (XLSX format)
     */
    public byte[] exportCasesToExcel(List<Case> cases) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cases");

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
                sheet.setColumnWidth(i, 5000);
            }

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
                        ? caseItem.getHearingDate().format(DATE_FORMATTER) : "Not Scheduled");
                row.createCell(8).setCellValue(
                    caseItem.getAssignedJudge() != null
                        ? caseItem.getAssignedJudge().getUsername() : "Unassigned");
            }

            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export all cases to PDF
     */
    public byte[] exportCasesToPDF(List<Case> cases) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
            Paragraph title = new Paragraph("Case Management Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            Paragraph date = new Paragraph("Generated: " + java.time.LocalDateTime.now().format(DATE_FORMATTER), dateFont);
            date.setAlignment(Element.ALIGN_RIGHT);
            date.setSpacingAfter(10);
            document.add(date);

            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);
            float[] columnWidths = {1.2f, 2f, 1f, 1.2f, 1.2f, 0.7f, 1.5f, 1.5f, 1.2f};
            table.setWidths(columnWidths);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            String[] headers = {"Case Number", "Title", "Type", "Status", "Court Level", "Priority", "Filing Date", "Hearing Date", "Judge"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            for (Case caseItem : cases) {
                table.addCell(new Phrase(caseItem.getCaseNumber(), dataFont));
                table.addCell(new Phrase(truncate(caseItem.getTitle(), 40), dataFont));
                table.addCell(new Phrase(caseItem.getCaseType().toString(), dataFont));
                table.addCell(new Phrase(caseItem.getStatus().toString(), dataFont));
                table.addCell(new Phrase(caseItem.getCourtLevel().name(), dataFont));
                table.addCell(new Phrase(String.valueOf(caseItem.getPriority()), dataFont));
                table.addCell(new Phrase(caseItem.getFilingDate().format(DATE_FORMATTER), dataFont));
                table.addCell(new Phrase(caseItem.getHearingDate() != null ? caseItem.getHearingDate().format(DATE_FORMATTER) : "Not Scheduled", dataFont));
                table.addCell(new Phrase(caseItem.getAssignedJudge() != null ? caseItem.getAssignedJudge().getUsername() : "Unassigned", dataFont));
            }
            document.add(table);
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Total Cases: " + cases.size(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    /**
     * Export single case history PDF — unique timeline with performer names & timestamps
     */
    public byte[] exportCaseDetailToPDF(Case caseItem) throws DocumentException {
        List<CaseAudit> history = caseAuditRepository.findByCaseEntityOrderByCreatedAtAsc(caseItem);
        return buildCaseHistoryPDF(caseItem, history);
    }

    private byte[] buildCaseHistoryPDF(Case caseItem, List<CaseAudit> history) throws DocumentException {
        Document document = new Document(PageSize.A4, 40, 40, 50, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PageNumberEvents());
            document.open();

            // ── Color palette ──────────────────────────────────────────────
            BaseColor headerBg   = new BaseColor(15, 52, 96);
            BaseColor accentBlue = new BaseColor(22, 96, 186);
            BaseColor lightBlue  = new BaseColor(232, 242, 254);
            BaseColor oddBg      = new BaseColor(245, 248, 255);
            BaseColor evenBg     = new BaseColor(255, 255, 255);
            BaseColor labelColor = new BaseColor(15, 52, 96);
            BaseColor mutedGray  = new BaseColor(120, 120, 130);
            BaseColor borderClr  = new BaseColor(210, 220, 235);
            BaseColor successG   = new BaseColor(40, 167, 69);
            BaseColor inactiveG  = new BaseColor(200, 200, 200);

            // Action-type pill colours
            BaseColor GREEN  = new BaseColor(0,  153, 102);
            BaseColor BLUE   = new BaseColor(33, 150, 243);
            BaseColor PURPLE = new BaseColor(156, 39, 176);
            BaseColor ORANGE = new BaseColor(255, 152,  0);
            BaseColor RED    = new BaseColor(198,  40, 40);
            BaseColor SLATE  = new BaseColor( 96, 125, 139);

            // ── Fonts ──────────────────────────────────────────────────────
            Font titleFt  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.WHITE);
            Font subFt    = FontFactory.getFont(FontFactory.HELVETICA, 11, new BaseColor(200, 220, 255));
            Font secFt    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, labelColor);
            Font lblFt    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, labelColor);
            Font valFt    = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            Font tsFt     = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, mutedGray);
            Font actFt    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);
            Font descFt   = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            Font byFt     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, accentBlue);
            Font detFt    = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, mutedGray);
            Font footerFt = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedGray);
            Font progressFt = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, BaseColor.WHITE);

            // ── BANNER ────────────────────────────────────────────────
            PdfPTable banner = new PdfPTable(1);
            banner.setWidthPercentage(100);
            PdfPCell bc = new PdfPCell();
            bc.setBackgroundColor(headerBg);
            bc.setPadding(18);
            bc.setBorder(Rectangle.NO_BORDER);
            Paragraph bt = new Paragraph("CASE HISTORY REPORT", titleFt);
            bt.setAlignment(Element.ALIGN_CENTER);
            bc.addElement(bt);
            Paragraph bs = new Paragraph(caseItem.getCaseNumber() + "  \u2022  " + caseItem.getTitle(), subFt);
            bs.setAlignment(Element.ALIGN_CENTER);
            bs.setSpacingBefore(5);
            bc.addElement(bs);
            banner.addCell(bc);
            document.add(banner);

            // ── PROGRESS BAR ──────────────────────────────────────────
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 5)));
            PdfPTable progress = new PdfPTable(3);
            progress.setWidthPercentage(100);
            
            String status = caseItem.getStatus().name();
            boolean isFiled = true;
            boolean isScheduled = status.equals("SCHEDULED") || status.equals("IN_PROGRESS") || status.equals("COMPLETED");
            boolean isCompleted = status.equals("COMPLETED");

            addProgressCell(progress, "FILED", isFiled, successG, inactiveG, progressFt);
            addProgressCell(progress, "SCHEDULED", isScheduled, successG, inactiveG, progressFt);
            addProgressCell(progress, "COMPLETED", isCompleted, successG, inactiveG, progressFt);
            
            document.add(progress);
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 10)));

            // ── CASE OVERVIEW GRID ────────────────────────────────────
            Paragraph ov = new Paragraph("CASE OVERVIEW", secFt);
            ov.setSpacingBefore(8);
            ov.setSpacingAfter(5);
            document.add(ov);

            PdfPTable grid = new PdfPTable(new float[]{1.3f, 2f, 1.3f, 2f});
            grid.setWidthPercentage(100);
            grid.setSpacingAfter(12);

            addInfoRow(grid, "Case Number",   caseItem.getCaseNumber(),                  lblFt, valFt, lightBlue, BaseColor.WHITE, borderClr);
            addInfoRow(grid, "Case Type",     caseItem.getCaseType().toString(),          lblFt, valFt, BaseColor.WHITE, lightBlue, borderClr);
            addInfoRow(grid, "Status",        caseItem.getStatus().toString(),            lblFt, valFt, lightBlue, BaseColor.WHITE, borderClr);
            addInfoRow(grid, "Court Level",   caseItem.getCourtLevel().getDisplayName(), lblFt, valFt, BaseColor.WHITE, lightBlue, borderClr);
            addInfoRow(grid, "Priority",      caseItem.getPriority() + " / 10",          lblFt, valFt, lightBlue, BaseColor.WHITE, borderClr);
            addInfoRow(grid, "Filing Date",   caseItem.getFilingDate().format(DISPLAY_FORMATTER), lblFt, valFt, BaseColor.WHITE, lightBlue, borderClr);
            addInfoRow(grid, "Hearing Date",
                caseItem.getHearingDate() != null ? caseItem.getHearingDate().format(DISPLAY_FORMATTER) : "Not Scheduled",
                lblFt, valFt, lightBlue, BaseColor.WHITE, borderClr);
            addInfoRow(grid, "Assigned Judge",
                caseItem.getAssignedJudge() != null
                    ? caseItem.getAssignedJudge().getFirstName() + " " + caseItem.getAssignedJudge().getLastName()
                    : "Unassigned",
                lblFt, valFt, BaseColor.WHITE, lightBlue, borderClr);

            document.add(grid);

            // ── FILING CLERK ──────────────────────────────────────────
            if (caseItem.getFilingClerk() != null) {
                com.example.dcm.model.User clk = caseItem.getFilingClerk();
                Paragraph clkP = new Paragraph(
                    "Filed by: " + clk.getFirstName() + " " + clk.getLastName()
                    + " [@" + clk.getUsername() + "]  |  Role: " + clk.getRole(), detFt);
                clkP.setSpacingAfter(8);
                document.add(clkP);
            }

            // ── TIMELINE HEADER ───────────────────────────────────────
            PdfPTable tlHdr = new PdfPTable(1);
            tlHdr.setWidthPercentage(100);
            PdfPCell tlC = new PdfPCell();
            tlC.setBackgroundColor(accentBlue);
            tlC.setPadding(9);
            tlC.setBorder(Rectangle.NO_BORDER);
            Paragraph tlT = new Paragraph(
                "CHANGE HISTORY TIMELINE  (" + history.size() + " event" + (history.size() == 1 ? "" : "s") + ")",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE));
            tlT.setAlignment(Element.ALIGN_CENTER);
            tlC.addElement(tlT);
            tlHdr.addCell(tlC);
            document.add(tlHdr);
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 3)));

            // ── EVENTS ───────────────────────────────────────────────
            if (history.isEmpty()) {
                Paragraph none = new Paragraph("No history recorded for this case yet.", valFt);
                none.setAlignment(Element.ALIGN_CENTER);
                none.setSpacingBefore(12);
                document.add(none);
            } else {
                int idx = 0;
                for (CaseAudit audit : history) {
                    BaseColor pillColor = resolvePillColor(audit.getActionType(),
                        GREEN, BLUE, PURPLE, ORANGE, RED, SLATE);
                    BaseColor rowBg = (idx % 2 == 0) ? oddBg : evenBg;

                    PdfPTable card = new PdfPTable(new float[]{0.018f, 0.982f});
                    card.setWidthPercentage(100);
                    card.setSpacingAfter(4);

                    PdfPCell stripe = new PdfPCell(new Phrase(" "));
                    stripe.setBackgroundColor(pillColor);
                    stripe.setBorder(Rectangle.NO_BORDER);
                    card.addCell(stripe);

                    PdfPCell content = new PdfPCell();
                    content.setBackgroundColor(rowBg);
                    content.setBorderColor(borderClr);
                    content.setBorderWidth(0.5f);
                    content.setPaddingTop(8);
                    content.setPaddingBottom(8);
                    content.setPaddingLeft(10);
                    content.setPaddingRight(10);

                    PdfPTable topRow = new PdfPTable(new float[]{1f, 1f});
                    topRow.setWidthPercentage(100);

                    PdfPCell pillCell = new PdfPCell(
                        new Phrase("  " + humanizeAction(audit.getActionType()) + "  ", actFt));
                    pillCell.setBackgroundColor(pillColor);
                    pillCell.setBorder(Rectangle.NO_BORDER);
                    pillCell.setPaddingTop(4);
                    pillCell.setPaddingBottom(4);
                    pillCell.setPaddingLeft(5);
                    pillCell.setPaddingRight(5);
                    topRow.addCell(pillCell);

                    String ts = audit.getCreatedAt() != null
                        ? audit.getCreatedAt().format(DISPLAY_FORMATTER) : "Unknown Time";
                    PdfPCell tsCell = new PdfPCell(new Phrase(ts, tsFt));
                    tsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    tsCell.setBorder(Rectangle.NO_BORDER);
                    tsCell.setBackgroundColor(rowBg);
                    topRow.addCell(tsCell);
                    content.addElement(topRow);

                    Paragraph d = new Paragraph(
                        audit.getDescription() != null ? audit.getDescription() : "\u2014", descFt);
                    d.setSpacingBefore(5);
                    content.addElement(d);

                    String performer;
                    if (audit.getPerformedBy() != null) {
                        com.example.dcm.model.User u = audit.getPerformedBy();
                        String role = u.getRole() != null ? " (" + u.getRole().name() + ")" : "";
                        performer = u.getFirstName() + " " + u.getLastName()
                            + "  [@" + u.getUsername() + "]" + role;
                    } else {
                        performer = "System";
                    }
                    Paragraph byP = new Paragraph("Updated by:  " + performer, byFt);
                    byP.setSpacingBefore(4);
                    content.addElement(byP);

                    if (audit.getDetails() != null && !audit.getDetails().isEmpty()) {
                        Paragraph det = new Paragraph("Details: " + audit.getDetails(), detFt);
                        det.setSpacingBefore(3);
                        content.addElement(det);
                    }

                    card.addCell(content);
                    document.add(card);
                    idx++;
                }
            }

            // ── FOOTER ────────────────────────────────────────────────
            document.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 6)));
            com.itextpdf.text.pdf.draw.LineSeparator footerLine =
                new com.itextpdf.text.pdf.draw.LineSeparator();
            footerLine.setLineColor(new BaseColor(200, 210, 225));
            document.add(new Chunk(footerLine));

            Paragraph footer = new Paragraph(
                "Differentiated Case Flow Management System  \u2022  Report generated on: "
                + java.time.LocalDateTime.now().format(DISPLAY_FORMATTER),
                footerFt);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(5);
            document.add(footer);

        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    private void addInfoRow(PdfPTable table, String label, String value,
            Font lblFt, Font valFt, BaseColor bg1, BaseColor bg2, BaseColor border) throws DocumentException {
        PdfPCell l = new PdfPCell(new Phrase(label, lblFt));
        l.setBackgroundColor(bg1); l.setPadding(7); l.setBorderColor(border);
        table.addCell(l);
        PdfPCell v = new PdfPCell(new Phrase(value != null ? value : "\u2014", valFt));
        v.setBackgroundColor(bg2); v.setPadding(7); v.setBorderColor(border);
        table.addCell(v);
    }

    private void addProgressCell(PdfPTable table, String label, boolean active, 
            BaseColor activeBg, BaseColor inactiveBg, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label, font));
        cell.setBackgroundColor(active ? activeBg : inactiveBg);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        cell.setBorderColor(BaseColor.WHITE);
        table.addCell(cell);
    }

    private BaseColor resolvePillColor(CaseAudit.ActionType type,
            BaseColor green, BaseColor blue, BaseColor purple,
            BaseColor orange, BaseColor red, BaseColor slate) {
        if (type == null) return slate;
        return switch (type) {
            case CASE_CREATED                              -> green;
            case STATUS_CHANGED, CASE_COMPLETED,
                 CASE_DISMISSED, CASE_REOPENED            -> blue;
            case JUDGE_ASSIGNED                           -> purple;
            case HEARING_SCHEDULED                        -> orange;
            case COURT_ESCALATED, APPEAL_FILED            -> red;
            default                                       -> slate;
        };
    }

    private String humanizeAction(CaseAudit.ActionType type) {
        if (type == null) return "UPDATE";
        return type.name().replace("_", " ");
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
