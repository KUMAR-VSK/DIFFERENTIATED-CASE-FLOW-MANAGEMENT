package com.example.dcm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.dcm.model.*;
import com.example.dcm.repository.*;
import com.example.dcm.service.CaseFlowAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private CaseFlowAnalyticsService analyticsService;

    /**
     * Get comprehensive case flow visualization data
     */
    @GetMapping("/case-flow")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE')")
    public ResponseEntity<Map<String, Object>> getCaseFlowVisualization() {
        Map<String, Object> flowData = analyticsService.getCaseFlowVisualization();
        return ResponseEntity.ok(flowData);
    }

    /**
     * Get flow metrics for a specific case
     */
    @GetMapping("/case-flow/{caseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE', 'CLERK')")
    public ResponseEntity<Map<String, Object>> getCaseFlowMetrics(@PathVariable Long caseId) {
        Map<String, Object> metrics = analyticsService.getCaseFlowMetrics(caseId);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get court level flow statistics
     */
    @GetMapping("/court-level-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE')")
    public ResponseEntity<Map<String, Object>> getCourtLevelStats() {
        Map<String, Object> stats = analyticsService.getCourtLevelFlowStats();
        return ResponseEntity.ok(stats);
    }
}
