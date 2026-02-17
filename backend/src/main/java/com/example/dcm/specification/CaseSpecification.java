package com.example.dcm.specification;

import com.example.dcm.dto.CaseSearchCriteria;
import com.example.dcm.model.Case;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CaseSpecification {

    public static Specification<Case> searchByCriteria(CaseSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search (searches in title, description, and case number)
            if (criteria.getKeyword() != null && !criteria.getKeyword().trim().isEmpty()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                Predicate titleMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), pattern
                );
                Predicate descMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), pattern
                );
                Predicate caseNumberMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("caseNumber")), pattern
                );
                predicates.add(criteriaBuilder.or(titleMatch, descMatch, caseNumberMatch));
            }

            // Case number exact match
            if (criteria.getCaseNumber() != null && !criteria.getCaseNumber().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    root.get("caseNumber"), criteria.getCaseNumber()
                ));
            }

            // Case types filter
            if (criteria.getCaseTypes() != null && !criteria.getCaseTypes().isEmpty()) {
                predicates.add(root.get("caseType").in(criteria.getCaseTypes()));
            }

            // Statuses filter
            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            }

            // Court levels filter
            if (criteria.getCourtLevels() != null && !criteria.getCourtLevels().isEmpty()) {
                predicates.add(root.get("courtLevel").in(criteria.getCourtLevels()));
            }

            // Filing date range
            if (criteria.getFilingDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("filingDate"),
                    criteria.getFilingDateFrom().atStartOfDay()
                ));
            }
            if (criteria.getFilingDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("filingDate"),
                    criteria.getFilingDateTo().atTime(23, 59, 59)
                ));
            }

            // Priority range
            if (criteria.getMinPriority() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("priority"), criteria.getMinPriority()
                ));
            }
            if (criteria.getMaxPriority() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("priority"), criteria.getMaxPriority()
                ));
            }

            // Assigned judge filter
            if (criteria.getAssignedJudgeId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("assignedJudge").get("id"),
                    criteria.getAssignedJudgeId()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
