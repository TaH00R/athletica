package com.freshco.backend.controller;

import com.freshco.backend.dto.LeaderboardEntry;
import com.freshco.backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/{sportId}")
    public List<LeaderboardEntry> getLeaderboard(
            @PathVariable Long sportId
    ) {
        return leaderboardService.getLeaderboard(sportId);
    }


    @GetMapping("/{sportId}/top")
    public List<LeaderboardEntry> getTopPlayers(
            @PathVariable Long sportId,
            @RequestParam(required = false) String statType,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return leaderboardService.getTopPlayers(
                sportId,
                statType,
                limit
        );
    }
}