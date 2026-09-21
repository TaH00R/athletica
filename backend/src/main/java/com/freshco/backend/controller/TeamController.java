package com.freshco.backend.controller;

import com.freshco.backend.dto.TeamRequest;
import com.freshco.backend.dto.TeamResponse;
import com.freshco.backend.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public List<TeamResponse> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamResponse getTeamById(@PathVariable Long id) {
        return teamService.getTeamById(id);
    }

    @GetMapping("/sport/{sportId}")
    public List<TeamResponse> getTeamsBySport(
            @PathVariable Long sportId
    ) {
        return teamService.getTeamsBySport(sportId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamResponse createTeam(
            @Valid @RequestBody TeamRequest request
    ) {
        return teamService.createTeam(request);
    }

    @PutMapping("/{id}")
    public TeamResponse updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody TeamRequest request
    ) {
        return teamService.updateTeam(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
    }
}