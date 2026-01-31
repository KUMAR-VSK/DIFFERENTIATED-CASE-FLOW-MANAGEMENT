package com.example.dcm.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.dcm.model.Case;
import com.example.dcm.model.Document;
import com.example.dcm.model.User;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.repository.DocumentRepository;
import com.example.dcm.repository.UserRepository;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentController {

    private static final String UPLOAD_DIR = "uploads/";

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") Long caseId) throws IOException {

        // Get the case
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create document record
        Document document = new Document();
        document.setOriginalFileName(originalFileName);
        document.setDescription("Uploaded document");
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setUrl("/api/documents/view/" + uniqueFileName);
        document.setCaseEntity(caseEntity);
        document.setDocumentType(Document.DocumentType.OTHER);
        document.setUploadDate(LocalDateTime.now());

        // Try to set uploadedBy from current user (if available)
        List<User> users = userRepository.findAll();
        if (!users.isEmpty()) {
            document.setUploadedBy(users.get(0)); // TODO: Get actual user from security context
        }

        documentRepository.save(document);

        // Update case's documents JSON field
        List<Document> documents = documentRepository.findByCaseEntityId(caseId);
        List<DocumentInfo> docInfos = new ArrayList<>();
        for (Document doc : documents) {
            DocumentInfo info = new DocumentInfo();
            info.setId(doc.getId());
            info.setOriginalFileName(doc.getOriginalFileName());
            info.setFileType(doc.getFileType());
            info.setFileSize(doc.getFileSize());
            info.setUploadDate(doc.getUploadDate().toString());
            info.setUrl("http://localhost:8080" + doc.getUrl());
            docInfos.add(info);
        }

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        String documentsJson;
        try {
            documentsJson = mapper.writeValueAsString(docInfos);
        } catch (Exception e) {
            documentsJson = "[]";
        }
        caseEntity.setDocuments(documentsJson);
        caseRepository.save(caseEntity);

        return ResponseEntity.ok("Document uploaded successfully");
    }

    @GetMapping("/view/{filename}")
    public ResponseEntity<byte[]> viewDocument(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        
        byte[] fileContent = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);
        
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(fileContent);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        
        byte[] fileContent = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);
        
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(fileContent);
    }

    // Inner class for document info JSON
    static class DocumentInfo {
        private Long id;
        private String originalFileName;
        private String fileType;
        private long fileSize;
        private String uploadDate;
        private String url;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getOriginalFileName() { return originalFileName; }
        public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        public String getUploadDate() { return uploadDate; }
        public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
