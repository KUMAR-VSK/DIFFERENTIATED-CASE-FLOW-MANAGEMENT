package com.example.dcm.controller;

import com.example.dcm.dto.CaseSearchCriteria;
import com.example.dcm.model.Case;
import com.example.dcm.repository.CaseRepository;
import com.example.dcm.specification.CaseSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases/search")
@CrossOrigin(origins = "*")
public class CaseSearchController {

    @Autowired
    private CaseRepository caseRepository;

    /**
     * Advanced search with multiple filters
     * GET /api/cases/search/advanced?keyword=contract&status=FILED&caseType=CIVIL
     */
    @GetMapping("/advanced")
    public Page<Case> searchCases(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Case.CaseType> caseTypes,
            @RequestParam(required = false) List<Case.Status> statuses,
            @RequestParam(required = false) List<Case.CourtLevel> courtLevels,
            @RequestParam(required = false) String filingDateFrom,
            @RequestParam(required = false) String filingDateTo,
            @RequestParam(required = false) Integer minPriority,
            @RequestParam(required = false) Integer maxPriority,
            @RequestParam(required = false) Long assignedJudgeId,
            @RequestParam(required = false) String caseNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "filingDate,desc") String[] sort
    ) {
        CaseSearchCriteria criteria = new CaseSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setCaseTypes(caseTypes);
        criteria.setStatuses(statuses);
        criteria.setCourtLevels(courtLevels);
        criteria.setMinPriority(minPriority);
        criteria.setMaxPriority(maxPriority);
        criteria.setAssignedJudgeId(assignedJudgeId);
        criteria.setCaseNumber(caseNumber);
        
        if (filingDateFrom != null) {
            criteria.setFilingDateFrom(java.time.LocalDate.parse(filingDateFrom));
        }
        if (filingDateTo != null) {
            criteria.setFilingDateTo(java.time.LocalDate.parse(filingDateTo));
        }

        // Parse sort parameters
        Sort sortObj = Sort.by(sort[0]);
        if (sort.length > 1 && "desc".equalsIgnoreCase(sort[1])) {
            sortObj = sortObj.descending();
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        return caseRepository.findAll(
            CaseSpecification.searchByCriteria(criteria), 
            pageable
        );
    }

    /**
     * Quick search by keyword only
     * GET /api/cases/search/quick?q=contract
     */
    @GetMapping("/quick")
    public List<Case> quickSearch(@RequestParam String q) {
        CaseSearchCriteria criteria = new CaseSearchCriteria();
        criteria.setKeyword(q);
        
        return caseRepository.findAll(CaseSpecification.searchByCriteria(criteria));
    }
}
