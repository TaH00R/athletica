package com.freshco.backend.service;

import com.freshco.backend.dto.TeamRequest;
import com.freshco.backend.dto.TeamResponse;
import com.freshco.backend.entity.Sport;
import com.freshco.backend.entity.Team;
import com.freshco.backend.repository.SportRepository;
import com.freshco.backend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final SportRepository sportRepository;

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getTeamsBySport(Long sportId) {

        if (!sportRepository.existsById(sportId)) {
            throw new RuntimeException("Sport not found with id: " + sportId);
        }

        return teamRepository.findBySportId(sportId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long id) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Team not found with id: " + id)
                );

        return toResponse(team);
    }

    public TeamResponse createTeam(TeamRequest request) {

        Sport sport = sportRepository.findById(request.sportId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: " + request.sportId()
                        )
                );

        if (teamRepository.existsByNameIgnoreCaseAndSportId(
                request.name(),
                request.sportId()
        )) {
            throw new IllegalArgumentException(
                    "Team already exists in this sport"
            );
        }

        Team team = Team.builder()
                .name(request.name())
                .logo(request.logo())
                .sport(sport)
                .build();

        return toResponse(teamRepository.save(team));
    }

    public TeamResponse updateTeam(Long id, TeamRequest request) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Team not found with id: " + id)
                );

        Sport sport = sportRepository.findById(request.sportId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: " + request.sportId()
                        )
                );

        team.setName(request.name());
        team.setLogo(request.logo());
        team.setSport(sport);

        return toResponse(team);
    }

    public void deleteTeam(Long id) {

        if (!teamRepository.existsById(id)) {
            throw new RuntimeException("Team not found with id: " + id);
        }

        teamRepository.deleteById(id);
    }

    private TeamResponse toResponse(Team team) {

        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getLogo(),
                team.getSport().getId(),
                team.getSport().getName()
        );
    }
}