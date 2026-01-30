package com.example.dcm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseNote;
import com.example.dcm.model.User;

@Repository
public interface CaseNoteRepository extends JpaRepository<CaseNote, Long> {

    // Find all notes for a case
    List<CaseNote> findByCaseEntity(Case caseEntity);

    // Find all notes for a case ordered by creation date (newest first)
    List<CaseNote> findByCaseEntityOrderByCreatedAtDesc(Case caseEntity);

    // Find notes by case ID
    List<CaseNote> findByCaseEntityId(Long caseId);

    // Find notes by type
    List<CaseNote> findByCaseEntityAndNoteType(Case caseEntity, CaseNote.NoteType noteType);

    // Find notes created by a specific user
    List<CaseNote> findByCreatedBy(User user);

    // Find finalized notes for a case
    List<CaseNote> findByCaseEntityAndIsFinalizedTrue(Case caseEntity);

    // Find note by ID and case
    Optional<CaseNote> findByIdAndCaseEntity(Long id, Case caseEntity);

    // Count notes for a case
    long countByCaseEntity(Case caseEntity);

    // Delete all notes for a case
    void deleteByCaseEntity(Case caseEntity);
}
