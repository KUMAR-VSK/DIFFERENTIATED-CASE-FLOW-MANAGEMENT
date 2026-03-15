package com.example.dcm.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.dcm.model.Case;
import com.example.dcm.model.CaseAudit;
import com.example.dcm.repository.CaseAuditRepository;
import com.example.dcm.repository.CaseRepository;

@Service
public class CaseFlowAnalyticsService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private CaseAuditRepository caseAuditRepository;

    /**
     * Get comprehensive case flow visualization data showing progression through court levels
     */
    public Map<String, Object> getCaseFlowVisualization() {
        return getCaseFlowVisualization(null);
    }

    /**
     * Get case flow visualization data filtered by court level
     */
    public Map<String, Object> getCaseFlowVisualization(Case.CourtLevel level) {
        List<Case> allCases;
        if (level != null) {
            allCases = caseRepository.findByCourtLevel(level);
        } else {
            allCases = caseRepository.findAll();
        }
        
        Map<String, Object> flowData = new HashMap<>();
        
        // Count cases at each court level
        Map<String, Long> courtLevelDistribution = allCases.stream()
            .collect(Collectors.groupingBy(
                c -> c.getCourtLevel().toString(),
                Collectors.counting()
            ));
        
        // Count cases at each status
        Map<String, Long> statusDistribution = allCases.stream()
            .collect(Collectors.groupingBy(
                c -> c.getStatus().toString(),
                Collectors.counting()
            ));
        
        // Calculate escalation path statistics
        List<Map<String, Object>> escalationPaths = calculateEscalationPaths(allCases);
        
        // Calculate average time at each status
        Map<String, Double> avgTimeByStatus = calculateAverageTimeByStatus();
        
        // Identify bottlenecks
        List<Map<String, Object>> bottlenecks = identifyBottlenecks(allCases);
        
        flowData.put("courtLevelDistribution", courtLevelDistribution);
        flowData.put("statusDistribution", statusDistribution);
        flowData.put("escalationPaths", escalationPaths);
        flowData.put("averageTimeByStatus", avgTimeByStatus);
        flowData.put("bottlenecks", bottlenecks);
        flowData.put("totalCases", allCases.size());
        
        return flowData;
    }

    /**
     * Calculate common escalation paths (District -> High -> Supreme)
     */
    private List<Map<String, Object>> calculateEscalationPaths(List<Case> cases) {
        Map<String, Integer> pathCounts = new HashMap<>();
        
        for (Case c : cases) {
            List<CaseAudit> audits = caseAuditRepository.findByCaseEntityOrderByCreatedAtAsc(c);
            
            StringBuilder pathBuilder = new StringBuilder();
            Case.CourtLevel previousLevel = null;
            
            for (CaseAudit audit : audits) {
                if (audit.getActionType() == CaseAudit.ActionType.COURT_ESCALATED) {
                    if (previousLevel == null && audit.getPreviousCourtLevel() != null) {
                        pathBuilder.append(audit.getPreviousCourtLevel().toString());
                        previousLevel = audit.getPreviousCourtLevel();
                    }
                    if (audit.getNewCourtLevel() != null && !audit.getNewCourtLevel().equals(previousLevel)) {
                        if (pathBuilder.length() > 0) {
                            pathBuilder.append(" → ");
                        }
                        pathBuilder.append(audit.getNewCourtLevel().toString());
                        previousLevel = audit.getNewCourtLevel();
                    }
                }
            }
            
            if (pathBuilder.length() > 0) {
                String path = pathBuilder.toString();
                pathCounts.put(path, pathCounts.getOrDefault(path, 0) + 1);
            }
        }
        
        return pathCounts.entrySet().stream()
            .map(entry -> {
                Map<String, Object> pathData = new HashMap<>();
                pathData.put("path", entry.getKey());
                pathData.put("count", entry.getValue());
                return pathData;
            })
            .sorted((a, b) -> ((Integer)b.get("count")).compareTo((Integer)a.get("count")))
            .collect(Collectors.toList());
    }

    /**
     * Calculate average time spent at each status
     */
    private Map<String, Double> calculateAverageTimeByStatus() {
        List<CaseAudit> allAudits = caseAuditRepository.findAll();
        
        Map<String, List<Long>> timeByStatus = new HashMap<>();
        Map<Long, Case.Status> caseCurrentStatus = new HashMap<>();
        Map<Long, LocalDateTime> caseStatusStartTime = new HashMap<>();
        
        // Group audits by case and process chronologically
        Map<Long, List<CaseAudit>> auditsByCase = allAudits.stream()
            .collect(Collectors.groupingBy(audit -> audit.getCaseEntity().getId()));
        
        for (Map.Entry<Long, List<CaseAudit>> entry : auditsByCase.entrySet()) {
            Long caseId = entry.getKey();
            List<CaseAudit> caseAudits = entry.getValue().stream()
                .sorted(Comparator.comparing(CaseAudit::getCreatedAt))
                .collect(Collectors.toList());
            
            for (CaseAudit audit : caseAudits) {
                if (audit.getActionType() == CaseAudit.ActionType.STATUS_CHANGED && audit.getNewStatus() != null) {
                    // If there was a previous status, calculate time spent
                    if (caseCurrentStatus.containsKey(caseId) && caseStatusStartTime.containsKey(caseId)) {
                        Case.Status prevStatus = caseCurrentStatus.get(caseId);
                        LocalDateTime startTime = caseStatusStartTime.get(caseId);
                        long daysInStatus = ChronoUnit.DAYS.between(startTime, audit.getCreatedAt());
                        
                        timeByStatus.computeIfAbsent(prevStatus.toString(), k -> new ArrayList<>()).add(daysInStatus);
                    }
                    
                    // Update current status
                    caseCurrentStatus.put(caseId, audit.getNewStatus());
                    caseStatusStartTime.put(caseId, audit.getCreatedAt());
                }
            }
        }
        
        // Calculate averages
        Map<String, Double> avgTimes = new HashMap<>();
        for (Map.Entry<String, List<Long>> entry : timeByStatus.entrySet()) {
            double avg = entry.getValue().stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
            avgTimes.put(entry.getKey(), avg);
        }
        
        return avgTimes;
    }

    /**
     * Identify bottlenecks based on cases stuck in certain statuses
     */
    private List<Map<String, Object>> identifyBottlenecks(List<Case> cases) {
        List<Map<String, Object>> bottlenecks = new ArrayList<>();
        
        // Group cases by status
        Map<Case.Status, List<Case>> casesByStatus = cases.stream()
            .collect(Collectors.groupingBy(Case::getStatus));
        
        for (Map.Entry<Case.Status, List<Case>> entry : casesByStatus.entrySet()) {
            Case.Status status = entry.getKey();
            List<Case> statusCases = entry.getValue();
            
            // Calculate average age of cases in this status
            double avgAge = statusCases.stream()
                .mapToLong(c -> ChronoUnit.DAYS.between(c.getFilingDate(), LocalDateTime.now()))
                .average()
                .orElse(0.0);
            
            // Find cases exceeding threshold (e.g., > 60 days)
            long stuckCases = statusCases.stream()
                .filter(c -> ChronoUnit.DAYS.between(c.getFilingDate(), LocalDateTime.now()) > 60)
                .count();
            
            if (stuckCases > 0) {
                Map<String, Object> bottleneck = new HashMap<>();
                bottleneck.put("status", status.toString());
                bottleneck.put("totalCases", statusCases.size());
                bottleneck.put("stuckCases", stuckCases);
                bottleneck.put("averageAge", avgAge);
                bottleneck.put("severity", calculateSeverity(stuckCases, statusCases.size()));
                
                bottlenecks.add(bottleneck);
            }
        }
        
        // Sort by severity (highest first)
        bottlenecks.sort((a, b) -> ((String)b.get("severity")).compareTo((String)a.get("severity")));
        
        return bottlenecks;
    }

    private String calculateSeverity(long stuckCases, int totalCases) {
        double percentage = (double) stuckCases / totalCases * 100;
        if (percentage >= 50) return "HIGH";
        if (percentage >= 25) return "MEDIUM";
        return "LOW";
    }

    /**
     * Get detailed flow metrics for a specific case
     */
    public Map<String, Object> getCaseFlowMetrics(Long caseId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) {
            return Collections.emptyMap();
        }
        
        Case caseEntity = caseOpt.get();
        List<CaseAudit> audits = caseAuditRepository.findByCaseEntityOrderByCreatedAtAsc(caseEntity);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // Calculate time in each status
        Map<String, Long> timeInStatus = new HashMap<>();
        Case.Status currentStatus = null;
        LocalDateTime statusStartTime = caseEntity.getFilingDate();
        
        for (CaseAudit audit : audits) {
            if (audit.getActionType() == CaseAudit.ActionType.STATUS_CHANGED && audit.getNewStatus() != null) {
                if (currentStatus != null) {
                    long days = ChronoUnit.DAYS.between(statusStartTime, audit.getCreatedAt());
                    timeInStatus.put(currentStatus.toString(), days);
                }
                currentStatus = audit.getNewStatus();
                statusStartTime = audit.getCreatedAt();
            }
        }
        
        // Add current status time
        if (currentStatus != null) {
            long days = ChronoUnit.DAYS.between(statusStartTime, LocalDateTime.now());
            timeInStatus.put(currentStatus.toString(), days);
        }
        
        // Build court level progression
        List<Map<String, Object>> courtLevelProgression = new ArrayList<>();
        for (CaseAudit audit : audits) {
            if (audit.getActionType() == CaseAudit.ActionType.COURT_ESCALATED) {
                Map<String, Object> transition = new HashMap<>();
                transition.put("from", audit.getPreviousCourtLevel() != null ? audit.getPreviousCourtLevel().toString() : "N/A");
                transition.put("to", audit.getNewCourtLevel() != null ? audit.getNewCourtLevel().toString() : "N/A");
                transition.put("date", audit.getCreatedAt());
                transition.put("action", audit.getActionType().toString());
                courtLevelProgression.add(transition);
            }
        }
        
        metrics.put("caseNumber", caseEntity.getCaseNumber());
        metrics.put("currentStatus", caseEntity.getStatus());
        metrics.put("currentCourtLevel", caseEntity.getCourtLevel());
        metrics.put("totalAge", ChronoUnit.DAYS.between(caseEntity.getFilingDate(), LocalDateTime.now()));
        metrics.put("timeInStatus", timeInStatus);
        metrics.put("courtLevelProgression", courtLevelProgression);
        metrics.put("totalTransitions", audits.size());
        
        return metrics;
    }

    /**
     * Get court level flow statistics
     */
    public Map<String, Object> getCourtLevelFlowStats() {
        return getCourtLevelFlowStats(null);
    }

    /**
     * Get court level flow statistics with optional court level filter
     */
    public Map<String, Object> getCourtLevelFlowStats(Case.CourtLevel level) {
        List<Case> allCases;
        if (level != null) {
            allCases = caseRepository.findByCourtLevel(level);
        } else {
            allCases = caseRepository.findAll();
        }
        
        Map<String, Object> stats = new HashMap<>();
        
        // Cases per court level
        Map<String, Long> casesPerLevel = allCases.stream()
            .collect(Collectors.groupingBy(
                c -> c.getCourtLevel().toString(),
                Collectors.counting()
            ));
        
        // Average priority per court level
        Map<String, Double> avgPriorityPerLevel = allCases.stream()
            .collect(Collectors.groupingBy(
                c -> c.getCourtLevel().toString(),
                Collectors.averagingInt(Case::getPriority)
            ));
        
        // Escalation rate (percentage of cases escalated from each level)
        long districtCases = allCases.stream()
            .filter(c -> c.getCourtLevel() == Case.CourtLevel.DISTRICT)
            .count();
        long escalatedFromDistrict = allCases.stream()
            .filter(c -> c.getEscalationReason() != null && c.getOriginalCaseId() != null)
            .count();
        
        double escalationRate = districtCases > 0 ? (double) escalatedFromDistrict / districtCases * 100 : 0;
        
        stats.put("casesPerLevel", casesPerLevel);
        stats.put("avgPriorityPerLevel", avgPriorityPerLevel);
        stats.put("escalationRate", escalationRate);
        stats.put("totalEscalatedCases", escalatedFromDistrict);
        
        return stats;
    }
}
