package com.freshco.backend.controller;

import com.freshco.backend.dto.MatchCreateRequest;
import com.freshco.backend.dto.MatchResponse;
import com.freshco.backend.dto.MatchScoreRequest;
import com.freshco.backend.dto.MatchStatusRequest;
import com.freshco.backend.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public List<MatchResponse> getAllMatches() {
        return matchService.getAllMatches();
    }

    @GetMapping("/{id}")
    public MatchResponse getMatchById(
            @PathVariable Long id
    ) {
        return matchService.getMatchById(id);
    }

    @GetMapping("/live")
    public List<MatchResponse> getLiveMatches() {
        return matchService.getLiveMatches();
    }

    @GetMapping("/upcoming")
    public List<MatchResponse> getUpcomingMatches() {
        return matchService.getUpcomingMatches();
    }

    @GetMapping("/completed")
    public List<MatchResponse> getCompletedMatches() {
        return matchService.getCompletedMatches();
    }

    @GetMapping("/sport/{sportId}")
    public List<MatchResponse> getMatchesBySport(
            @PathVariable Long sportId
    ) {
        return matchService.getMatchesBySport(sportId);
    }

    @GetMapping("/sport/{sportId}/live")
    public List<MatchResponse> getLiveMatchesBySport(
            @PathVariable Long sportId
    ) {
        return matchService.getLiveMatchesBySport(sportId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatchResponse createMatch(
            @Valid @RequestBody MatchCreateRequest request
    ) {
        return matchService.createMatch(request);
    }

    @PutMapping("/{id}")
    public MatchResponse updateMatch(
            @PathVariable Long id,
            @Valid @RequestBody MatchCreateRequest request
    ) {
        return matchService.updateMatch(id, request);
    }

    @PutMapping("/{id}/score")
    public MatchResponse updateScore(
            @PathVariable Long id,
            @Valid @RequestBody MatchScoreRequest request
    ) {
        return matchService.updateScore(id, request);
    }

    @PutMapping("/{id}/status")
    public MatchResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MatchStatusRequest request
    ) {
        return matchService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMatch(
            @PathVariable Long id
    ) {
        matchService.deleteMatch(id);
    }
}