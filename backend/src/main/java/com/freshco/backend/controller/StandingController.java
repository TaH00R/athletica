package com.freshco.backend.controller;

import com.freshco.backend.dto.StandingResponse;
import com.freshco.backend.service.StandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standings")
@RequiredArgsConstructor
public class StandingController {

    private final StandingService standingService;

    @GetMapping("/{sportId}")
    public List<StandingResponse> getStandings(
            @PathVariable Long sportId
    ) {
        return standingService.getStandings(sportId);
    }

    @PostMapping("/{sportId}/recalculate")
    public void recalculateStandings(
            @PathVariable Long sportId
    ) {
        standingService.recalculateStandings(sportId);
    }
}