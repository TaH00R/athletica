package com.freshco.backend.controller;

import com.freshco.backend.dto.PlayerStatRequest;
import com.freshco.backend.dto.PlayerStatResponse;
import com.freshco.backend.service.PlayerStatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player-stats")
@RequiredArgsConstructor
public class PlayerStatController {

    private final PlayerStatService playerStatService;

    @GetMapping
    public List<PlayerStatResponse> getAllStats() {
        return playerStatService.getAllStats();
    }

    @GetMapping("/{id}")
    public PlayerStatResponse getStatById(
            @PathVariable Long id
    ) {
        return playerStatService.getStatById(id);
    }

    @GetMapping("/player/{playerId}")
    public List<PlayerStatResponse> getStatsByPlayer(
            @PathVariable Long playerId
    ) {
        return playerStatService.getStatsByPlayer(playerId);
    }

    @GetMapping("/match/{matchId}")
    public List<PlayerStatResponse> getStatsByMatch(
            @PathVariable Long matchId
    ) {
        return playerStatService.getStatsByMatch(matchId);
    }

    @GetMapping("/match/{matchId}/type/{statType}")
    public List<PlayerStatResponse> getStatsByMatchAndType(
            @PathVariable Long matchId,
            @PathVariable String statType
    ) {
        return playerStatService.getStatsByMatchAndType(
                matchId,
                statType
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerStatResponse createOrUpdateStat(
            @Valid @RequestBody PlayerStatRequest request
    ) {
        return playerStatService.createOrUpdateStat(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStat(
            @PathVariable Long id
    ) {
        playerStatService.deleteStat(id);
    }
}