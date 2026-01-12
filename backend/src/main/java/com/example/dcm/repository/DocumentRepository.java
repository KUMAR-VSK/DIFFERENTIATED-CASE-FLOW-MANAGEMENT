package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCaseEntityId(Long caseId);
    List<Document> findByCaseEntityIdOrderByUploadDateDesc(Long caseId);
}
