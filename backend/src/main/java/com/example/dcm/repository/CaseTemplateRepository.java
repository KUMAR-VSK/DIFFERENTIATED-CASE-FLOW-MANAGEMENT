package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseTemplate;

@Repository
public interface CaseTemplateRepository extends JpaRepository<CaseTemplate, Long> {

    List<CaseTemplate> findByIsActiveTrue();

    List<CaseTemplate> findByCaseType(Case.CaseType caseType);

    @Query("SELECT ct FROM CaseTemplate ct WHERE ct.caseType = :caseType AND ct.isActive = true")
    List<CaseTemplate> findActiveByCaseType(Case.CaseType caseType);

    CaseTemplate findByName(String name);
}
