package com.example.backend.controller;

import com.example.backend.dto.usage.ModelBreakdownResponse;
import com.example.backend.dto.usage.TimeseriesPointResponse;
import com.example.backend.dto.usage.UsageSummaryResponse;
import com.example.backend.exception.ApiException;
import com.example.backend.service.UsageQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageQueryService usageQueryService;

    @GetMapping("/summary")
    public UsageSummaryResponse summary(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return usageQueryService.summary(start, end);
    }

    @GetMapping("/timeseries")
    public List<TimeseriesPointResponse> timeseries(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
                                                      @RequestParam(defaultValue = "day") String groupBy) {
        return usageQueryService.timeseries(start, end, parseGroupBy(groupBy));
    }

    @GetMapping("/by-model")
    public List<ModelBreakdownResponse> byModel(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return usageQueryService.byModel(start, end);
    }

    private UsageQueryService.GroupBy parseGroupBy(String raw) {
        try {
            return UsageQueryService.GroupBy.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "groupBy must be one of: day, model, key");
        }
    }
}
