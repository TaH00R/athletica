package com.freshco.backend.service;

import com.freshco.backend.dto.PlayerRequest;
import com.freshco.backend.dto.PlayerResponse;
import com.freshco.backend.entity.Player;
import com.freshco.backend.entity.Team;
import com.freshco.backend.repository.PlayerRepository;
import com.freshco.backend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<PlayerResponse> getAllPlayers() {
        return playerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> getPlayersByTeam(Long teamId) {

        if (!teamRepository.existsById(teamId)) {
            throw new RuntimeException("Team not found with id: " + teamId);
        }

        return playerRepository.findByTeamId(teamId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> getActivePlayersByTeam(Long teamId) {

        if (!teamRepository.existsById(teamId)) {
            throw new RuntimeException("Team not found with id: " + teamId);
        }

        return playerRepository.findByTeamIdAndActiveTrue(teamId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlayerResponse getPlayerById(Long id) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Player not found with id: " + id)
                );

        return toResponse(player);
    }

    public PlayerResponse createPlayer(PlayerRequest request) {

        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team not found with id: " + request.teamId()
                        )
                );

        if (playerRepository.existsByNameIgnoreCaseAndTeamId(
                request.name(),
                request.teamId()
        )) {
            throw new IllegalArgumentException(
                    "Player already exists in this team"
            );
        }

        Player player = Player.builder()
                .name(request.name())
                .jerseyNumber(request.jerseyNumber())
                .image(request.image())
                .active(request.active() != null ? request.active() : true)
                .team(team)
                .build();

        return toResponse(playerRepository.save(player));
    }

    public PlayerResponse updatePlayer(Long id, PlayerRequest request) {

        Player player = playerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Player not found with id: " + id)
                );

        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team not found with id: " + request.teamId()
                        )
                );

        player.setName(request.name());
        player.setJerseyNumber(request.jerseyNumber());
        player.setImage(request.image());
        player.setTeam(team);

        if (request.active() != null) {
            player.setActive(request.active());
        }

        return toResponse(player);
    }

    public void deletePlayer(Long id) {

        if (!playerRepository.existsById(id)) {
            throw new RuntimeException("Player not found with id: " + id);
        }

        playerRepository.deleteById(id);
    }

    private PlayerResponse toResponse(Player player) {

        Team team = player.getTeam();

        return new PlayerResponse(
                player.getId(),
                player.getName(),
                player.getJerseyNumber(),
                player.getImage(),
                player.getActive(),
                team.getId(),
                team.getName(),
                team.getSport().getId(),
                team.getSport().getName()
        );
    }
}