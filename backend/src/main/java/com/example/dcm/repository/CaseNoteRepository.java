package com.example.dcm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseNote;
import com.example.dcm.model.User;

@Repository
public interface CaseNoteRepository extends JpaRepository<CaseNote, Long> {

    List<CaseNote> findByCaseEntityOrderByCreatedAtDesc(Case caseEntity);

    List<CaseNote> findByCreatedByOrderByCreatedAtDesc(User createdBy);
}
