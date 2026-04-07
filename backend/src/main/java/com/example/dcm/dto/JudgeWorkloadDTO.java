package com.example.dcm.dto;

import com.example.dcm.model.User;

public class JudgeWorkloadDTO {
    private User judge;
    private long activeCaseCount;
    private long totalPriorityPoints;
    private double workloadScore; // Higher means busier
    private boolean isRecommended;

    public JudgeWorkloadDTO(User judge, long activeCaseCount, long totalPriorityPoints) {
        this.judge = judge;
        this.activeCaseCount = activeCaseCount;
        this.totalPriorityPoints = totalPriorityPoints;
        // Simple workload score Calculation: Count + (SumPriority / 10)
        this.workloadScore = activeCaseCount + (totalPriorityPoints / 10.0);
    }

    // Getters and Setters
    public User getJudge() { return judge; }
    public void setJudge(User judge) { this.judge = judge; }

    public long getActiveCaseCount() { return activeCaseCount; }
    public void setActiveCaseCount(long activeCaseCount) { this.activeCaseCount = activeCaseCount; }

    public long getTotalPriorityPoints() { return totalPriorityPoints; }
    public void setTotalPriorityPoints(long totalPriorityPoints) { this.totalPriorityPoints = totalPriorityPoints; }

    public double getWorkloadScore() { return workloadScore; }
    public void setWorkloadScore(double workloadScore) { this.workloadScore = workloadScore; }

    public boolean isRecommended() { return isRecommended; }
    public void setRecommended(boolean recommended) { isRecommended = recommended; }
}
