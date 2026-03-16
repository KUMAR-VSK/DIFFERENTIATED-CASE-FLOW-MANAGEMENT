package com.example.dcm.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;

public class ScheduleRequest {

    @NotBlank(message = "Hearing date is required")
    private String hearingDate;

    public ScheduleRequest() {}

    public String getHearingDate() { return hearingDate; }
    public void setHearingDate(String hearingDate) { this.hearingDate = hearingDate; }
}
