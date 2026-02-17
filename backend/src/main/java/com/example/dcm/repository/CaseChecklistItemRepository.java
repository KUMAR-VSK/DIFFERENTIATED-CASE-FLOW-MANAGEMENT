package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseChecklistItem;

@Repository
public interface CaseChecklistItemRepository extends JpaRepository<CaseChecklistItem, Long> {

    List<CaseChecklistItem> findByCaseEntityOrderByStepNumber(Case caseEntity);

    @Query("SELECT cci FROM CaseChecklistItem cci WHERE cci.caseEntity.id = :caseId ORDER BY cci.stepNumber ASC")
    List<CaseChecklistItem> findByCaseIdOrderByStepNumber(Long caseId);

    @Query("SELECT cci FROM CaseChecklistItem cci WHERE cci.caseEntity.id = :caseId AND cci.status = :status")
    List<CaseChecklistItem> findByCaseIdAndStatus(Long caseId, CaseChecklistItem.ChecklistStatus status);

    @Query("SELECT cci FROM CaseChecklistItem cci WHERE cci.caseEntity.id = :caseId AND cci.isMandatory = true AND cci.status != 'COMPLETED'")
    List<CaseChecklistItem> findIncompleteMandatoryItemsByCaseId(Long caseId);

    @Query("SELECT COUNT(cci) FROM CaseChecklistItem cci WHERE cci.caseEntity.id = :caseId AND cci.status = 'COMPLETED'")
    Long countCompletedItemsByCaseId(Long caseId);

    @Query("SELECT COUNT(cci) FROM CaseChecklistItem cci WHERE cci.caseEntity.id = :caseId")
    Long countTotalItemsByCaseId(Long caseId);
}
