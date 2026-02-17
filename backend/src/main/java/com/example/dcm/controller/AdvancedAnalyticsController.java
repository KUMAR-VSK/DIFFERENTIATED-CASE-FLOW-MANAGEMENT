package com.example.dcm.controller;

import com.example.dcm.model.Case;
import com.example.dcm.repository.CaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AdvancedAnalyticsController {

    @Autowired
    private CaseRepository caseRepository;

    @GetMapping("/advanced")
    public Map<String, Object> getAdvancedAnalytics(@RequestParam(defaultValue = "30") int period) {
        List<Case> allCases = caseRepository.findAll();
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(period);
        
        List<Case> casesInPeriod = allCases.stream()
                .filter(c -> c.getFilingDate().isAfter(cutoffDate))
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();

        // Total counts
        analytics.put("totalCases", allCases.size());
        analytics.put("completedCases", 
            allCases.stream().filter(c -> c.getStatus() == Case.Status.COMPLETED).count());
        analytics.put("inProgressCases", 
            allCases.stream().filter(c -> c.getStatus() == Case.Status.IN_PROGRESS).count());
        analytics.put("highPriorityCases", 
            allCases.stream().filter(c -> c.getPriority() >= 7).count());

        // Status distribution
        Map<String, Long> statusDist = allCases.stream()
                .collect(Collectors.groupingBy(
                    c -> c.getStatus().toString(), 
                    Collectors.counting()
                ));
        analytics.put("statusDistribution", statusDist);

        // Case type distribution
        Map<String, Long> typeDist = allCases.stream()
                .collect(Collectors.groupingBy(
                    c -> c.getCaseType().toString(), 
                    Collectors.counting()
                ));
        analytics.put("caseTypeDistribution", typeDist);

        // Court level distribution
        Map<String, Long> courtDist = allCases.stream()
                .collect(Collectors.groupingBy(
                    c -> c.getCourtLevel().toString(), 
                    Collectors.counting()
                ));
        analytics.put("courtLevelDistribution", courtDist);

        // Priority distribution
        Map<String, Long> priorityDist = new HashMap<>();
        priorityDist.put("low", allCases.stream().filter(c -> c.getPriority() <= 3).count());
        priorityDist.put("medium", allCases.stream().filter(c -> c.getPriority() >= 4 && c.getPriority() <= 6).count());
        priorityDist.put("high", allCases.stream().filter(c -> c.getPriority() >= 7).count());
        analytics.put("priorityDistribution", priorityDist);

        // Trend data (last 30 days)
        Map<String, Object> trend = generateTrendData(casesInPeriod, period);
        analytics.put("trend", trend);

        return analytics;
    }

    private Map<String, Object> generateTrendData(List<Case> cases, int days) {
        Map<String, Object> trend = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> filed = new ArrayList<>();
        List<Long> completed = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime nextDate = date.plusDays(1);
            
            labels.add(date.toLocalDate().toString());
            
            long filedCount = cases.stream()
                    .filter(c -> c.getFilingDate().isAfter(date) && c.getFilingDate().isBefore(nextDate))
                    .count();
            filed.add(filedCount);
            
            long completedCount = cases.stream()
                    .filter(c -> c.getStatus() == Case.Status.COMPLETED)
                    .filter(c -> c.getUpdatedAt() != null && c.getUpdatedAt().isAfter(date) && c.getUpdatedAt().isBefore(nextDate))
                    .count();
            completed.add(completedCount);
        }

        trend.put("labels", labels);
        trend.put("filed", filed);
        trend.put("completed", completed);

        return trend;
    }
}
