package com.freshco.backend.controller;

import com.freshco.backend.dto.PlayerRequest;
import com.freshco.backend.dto.PlayerResponse;
import com.freshco.backend.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    public List<PlayerResponse> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/{id}")
    public PlayerResponse getPlayerById(@PathVariable Long id) {
        return playerService.getPlayerById(id);
    }

    @GetMapping("/team/{teamId}")
    public List<PlayerResponse> getPlayersByTeam(
            @PathVariable Long teamId
    ) {
        return playerService.getPlayersByTeam(teamId);
    }

    @GetMapping("/team/{teamId}/active")
    public List<PlayerResponse> getActivePlayersByTeam(
            @PathVariable Long teamId
    ) {
        return playerService.getActivePlayersByTeam(teamId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerResponse createPlayer(
            @Valid @RequestBody PlayerRequest request
    ) {
        return playerService.createPlayer(request);
    }

    @PutMapping("/{id}")
    public PlayerResponse updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody PlayerRequest request
    ) {
        return playerService.updatePlayer(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
    }
}