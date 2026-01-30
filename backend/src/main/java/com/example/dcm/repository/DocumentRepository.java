package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.Document;
import com.example.dcm.model.User;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Find all documents for a case
    List<Document> findByCaseEntity(Case caseEntity);

    // Find all documents for a case ordered by upload date
    List<Document> findByCaseEntityOrderByUploadDateDesc(Case caseEntity);

    // Find documents by case ID
    List<Document> findByCaseEntityId(Long caseId);

    // Find documents uploaded by a specific user
    List<Document> findByUploadedBy(User user);

    // Find documents by type
    List<Document> findByCaseEntityAndDocumentType(Case caseEntity, Document.DocumentType documentType);

    // Count documents for a case
    long countByCaseEntity(Case caseEntity);

    // Delete all documents for a case
    void deleteByCaseEntity(Case caseEntity);
}
