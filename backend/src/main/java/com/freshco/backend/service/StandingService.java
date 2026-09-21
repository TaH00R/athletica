package com.freshco.backend.service;

import com.freshco.backend.dto.StandingResponse;
import com.freshco.backend.entity.Match;
import com.freshco.backend.entity.MatchStatus;
import com.freshco.backend.entity.Sport;
import com.freshco.backend.entity.Standing;
import com.freshco.backend.entity.Team;
import com.freshco.backend.repository.MatchRepository;
import com.freshco.backend.repository.SportRepository;
import com.freshco.backend.repository.StandingRepository;
import com.freshco.backend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class StandingService {

    private final StandingRepository standingRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final SportRepository sportRepository;

    @Transactional(readOnly = true)
    public List<StandingResponse> getStandings(Long sportId) {

        if (!sportRepository.existsById(sportId)) {
            throw new RuntimeException(
                    "Sport not found with id: " + sportId
            );
        }

        List<Standing> standings =
                standingRepository.findByTeamSportId(sportId);

        standings = standings.stream()
                .sorted(
                        Comparator
                                .comparing(
                                        Standing::getPoints,
                                        Comparator.reverseOrder()
                                )
                                .thenComparing(
                                        Standing::getWins,
                                        Comparator.reverseOrder()
                                )
                                .thenComparing(
                                        Standing::getDraws,
                                        Comparator.reverseOrder()
                                )
                                .thenComparing(
                                        standing ->
                                                standing
                                                        .getTeam()
                                                        .getName()
                                )
                )
                .toList();

        List<StandingResponse> response =
                new ArrayList<>();

        for (int i = 0; i < standings.size(); i++) {

            Standing standing = standings.get(i);

            response.add(
                    new StandingResponse(
                            i + 1,
                            standing.getTeam().getId(),
                            standing.getTeam().getName(),
                            standing.getPlayed(),
                            standing.getWins(),
                            standing.getLosses(),
                            standing.getDraws(),
                            standing.getPoints()
                    )
            );
        }

        return response;
    }

    public void recalculateStandings(Long sportId) {

        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: " + sportId
                        )
                );

        List<Team> teams =
                teamRepository.findBySportId(sportId);

        List<Match> completedMatches =
                matchRepository
                        .findBySportIdAndStatusOrderByScheduledAtAsc(
                                sportId,
                                MatchStatus.COMPLETED
                        );

        Map<Long, Standing> standings =
                new HashMap<>();

        for (Team team : teams) {

            Standing standing =
                    standingRepository
                            .findByTeamId(team.getId())
                            .orElseGet(() ->
                                    Standing.builder()
                                            .team(team)
                                            .build()
                            );

            standing.setPlayed(0);
            standing.setWins(0);
            standing.setLosses(0);
            standing.setDraws(0);
            standing.setPoints(0);

            standings.put(
                    team.getId(),
                    standing
            );
        }

        for (Match match : completedMatches) {

            Team teamA = match.getTeamA();
            Team teamB = match.getTeamB();

            Standing standingA =
                    standings.get(teamA.getId());

            Standing standingB =
                    standings.get(teamB.getId());

            if (standingA == null || standingB == null) {
                continue;
            }

            standingA.setPlayed(
                    standingA.getPlayed() + 1
            );

            standingB.setPlayed(
                    standingB.getPlayed() + 1
            );

            Team winner = match.getWinner();

            if (winner == null) {

                standingA.setDraws(
                        standingA.getDraws() + 1
                );

                standingB.setDraws(
                        standingB.getDraws() + 1
                );

                standingA.setPoints(
                        standingA.getPoints()
                                + sport.getDrawPoints()
                );

                standingB.setPoints(
                        standingB.getPoints()
                                + sport.getDrawPoints()
                );
            }


            else if (winner.getId().equals(teamA.getId())) {

                standingA.setWins(
                        standingA.getWins() + 1
                );

                standingB.setLosses(
                        standingB.getLosses() + 1
                );

                standingA.setPoints(
                        standingA.getPoints()
                                + sport.getWinPoints()
                );

                standingB.setPoints(
                        standingB.getPoints()
                                + sport.getLossPoints()
                );
            }


            else if (winner.getId().equals(teamB.getId())) {

                standingB.setWins(
                        standingB.getWins() + 1
                );

                standingA.setLosses(
                        standingA.getLosses() + 1
                );

                standingB.setPoints(
                        standingB.getPoints()
                                + sport.getWinPoints()
                );

                standingA.setPoints(
                        standingA.getPoints()
                                + sport.getLossPoints()
                );
            }
        }

        standingRepository.saveAll(
                standings.values()
        );
    }
}