package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Document;
import com.example.dcm.model.DocumentApproval;
import com.example.dcm.model.User;

@Repository
public interface DocumentApprovalRepository extends JpaRepository<DocumentApproval, Long> {

    List<DocumentApproval> findByDocument(Document document);

    List<DocumentApproval> findByReviewer(User reviewer);

    List<DocumentApproval> findByStatus(DocumentApproval.ApprovalStatus status);

    @Query("SELECT da FROM DocumentApproval da WHERE da.reviewer.id = :reviewerId AND da.status = 'PENDING'")
    List<DocumentApproval> findPendingApprovalsByReviewerId(Long reviewerId);

    @Query("SELECT da FROM DocumentApproval da WHERE da.document.id = :documentId ORDER BY da.approvalLevel ASC")
    List<DocumentApproval> findByDocumentIdOrderByApprovalLevel(Long documentId);
}
