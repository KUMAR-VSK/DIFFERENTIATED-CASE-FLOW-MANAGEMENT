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

    @Autowired
    private UserRepository userRepository;

    private Case.CourtLevel convertLevel(User.CourtLevel level) {
        if (level == null) return null;
        try {
            return Case.CourtLevel.valueOf(level.name());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get comprehensive case flow visualization data
     */
    @GetMapping("/case-flow")
    @PreAuthorize("hasAnyRole('ADMIN', 'JUDGE')")
    public ResponseEntity<Map<String, Object>> getCaseFlowVisualization(org.springframework.security.core.Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        Case.CourtLevel level = (user != null && user.getRole() != User.Role.ADMIN) ? convertLevel(user.getCourtLevel()) : null;
        
        Map<String, Object> flowData = analyticsService.getCaseFlowVisualization(level);
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
    public ResponseEntity<Map<String, Object>> getCourtLevelStats(org.springframework.security.core.Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        Case.CourtLevel level = (user != null && user.getRole() != User.Role.ADMIN) ? convertLevel(user.getCourtLevel()) : null;

        Map<String, Object> stats = analyticsService.getCourtLevelFlowStats(level);
        return ResponseEntity.ok(stats);
    }
}
