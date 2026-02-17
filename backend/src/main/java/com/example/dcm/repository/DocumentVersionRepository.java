package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Document;
import com.example.dcm.model.DocumentVersion;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    List<DocumentVersion> findByDocumentOrderByVersionNumberDesc(Document document);

    @Query("SELECT dv FROM DocumentVersion dv WHERE dv.document.id = :documentId ORDER BY dv.versionNumber DESC")
    List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(@Param("documentId") Long documentId);

    @Query("SELECT dv FROM DocumentVersion dv WHERE dv.document.id = :documentId AND dv.isCurrent = true")
    DocumentVersion findCurrentVersionByDocumentId(@Param("documentId") Long documentId);

    @Query("SELECT MAX(dv.versionNumber) FROM DocumentVersion dv WHERE dv.document.id = :documentId")
    Integer findMaxVersionNumberByDocumentId(@Param("documentId") Long documentId);
}
