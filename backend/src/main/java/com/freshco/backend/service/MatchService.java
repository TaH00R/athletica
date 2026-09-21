package com.freshco.backend.service;

import com.freshco.backend.dto.MatchCreateRequest;
import com.freshco.backend.dto.MatchResponse;
import com.freshco.backend.dto.MatchScoreRequest;
import com.freshco.backend.dto.MatchStatusRequest;
import com.freshco.backend.entity.Match;
import com.freshco.backend.entity.MatchStatus;
import com.freshco.backend.entity.Sport;
import com.freshco.backend.entity.Team;
import com.freshco.backend.repository.MatchRepository;
import com.freshco.backend.repository.SportRepository;
import com.freshco.backend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final SportRepository sportRepository;
    private final TeamRepository teamRepository;
    private final StandingService standingService;
    private final MatchWebSocketService matchWebSocketService;

    @Transactional(readOnly = true)
    public List<MatchResponse> getAllMatches() {
        return matchRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatchById(Long id) {
        return toResponse(findMatch(id));
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getLiveMatches() {
        return matchRepository
                .findByStatusOrderByScheduledAtAsc(MatchStatus.LIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getUpcomingMatches() {
        return matchRepository
                .findByStatusOrderByScheduledAtAsc(MatchStatus.UPCOMING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getCompletedMatches() {
        return matchRepository
                .findByStatusOrderByScheduledAtAsc(MatchStatus.COMPLETED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesBySport(Long sportId) {

        if (!sportRepository.existsById(sportId)) {
            throw new RuntimeException(
                    "Sport not found with id: " + sportId
            );
        }

        return matchRepository
                .findBySportIdOrderByScheduledAtAsc(sportId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getLiveMatchesBySport(Long sportId) {

        if (!sportRepository.existsById(sportId)) {
            throw new RuntimeException(
                    "Sport not found with id: " + sportId
            );
        }

        return matchRepository
                .findBySportIdAndStatusOrderByScheduledAtAsc(
                        sportId,
                        MatchStatus.LIVE
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MatchResponse createMatch(MatchCreateRequest request) {

        Sport sport = sportRepository
                .findById(request.sportId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: "
                                        + request.sportId()
                        )
                );

        Team teamA = teamRepository
                .findById(request.teamAId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team A not found with id: "
                                        + request.teamAId()
                        )
                );

        Team teamB = teamRepository
                .findById(request.teamBId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team B not found with id: "
                                        + request.teamBId()
                        )
                );

        validateTeams(sport, teamA, teamB);

        Match match = Match.builder()
                .sport(sport)
                .teamA(teamA)
                .teamB(teamB)
                .scoreA("0")
                .scoreB("0")
                .venue(request.venue())
                .roundName(request.roundName())
                .scheduledAt(request.scheduledAt())
                .status(MatchStatus.UPCOMING)
                .winner(null)
                .build();

        Match savedMatch = matchRepository.save(match);

        return toResponse(savedMatch);
    }

    public MatchResponse updateMatch(
            Long id,
            MatchCreateRequest request
    ) {

        Match match = findMatch(id);

        Sport sport = sportRepository
                .findById(request.sportId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: "
                                        + request.sportId()
                        )
                );

        Team teamA = teamRepository
                .findById(request.teamAId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team A not found with id: "
                                        + request.teamAId()
                        )
                );

        Team teamB = teamRepository
                .findById(request.teamBId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Team B not found with id: "
                                        + request.teamBId()
                        )
                );

        validateTeams(sport, teamA, teamB);

        if (match.getStatus() == MatchStatus.LIVE
                || match.getStatus() == MatchStatus.COMPLETED) {

            boolean sportChanged =
                    !match.getSport().getId().equals(sport.getId());

            boolean teamAChanged =
                    !match.getTeamA().getId().equals(teamA.getId());

            boolean teamBChanged =
                    !match.getTeamB().getId().equals(teamB.getId());

            if (sportChanged || teamAChanged || teamBChanged) {
                throw new IllegalStateException(
                        "Cannot change sport or teams of a live or completed match"
                );
            }
        }

        match.setSport(sport);
        match.setTeamA(teamA);
        match.setTeamB(teamB);
        match.setVenue(request.venue());
        match.setRoundName(request.roundName());
        match.setScheduledAt(request.scheduledAt());

        return toResponse(match);
    }

    public MatchResponse updateScore(
            Long id,
            MatchScoreRequest request
    ) {

        Match match = findMatch(id);

        if (match.getStatus() != MatchStatus.LIVE) {
            throw new IllegalStateException(
                    "Score can only be updated for a live match"
            );
        }

        match.setScoreA(request.scoreA());
        match.setScoreB(request.scoreB());

        matchWebSocketService.broadcastMatchUpdate(match);

        return toResponse(match);
    }

    public MatchResponse updateStatus(
            Long id,
            MatchStatusRequest request
    ) {

        Match match = findMatch(id);

        MatchStatus oldStatus = match.getStatus();
        MatchStatus newStatus = request.status();

        validateStatusTransition(oldStatus, newStatus);

        if (newStatus == MatchStatus.COMPLETED) {

            if (request.winnerTeamId() != null) {

                Long winnerId = request.winnerTeamId();

                if (!winnerId.equals(match.getTeamA().getId())
                        && !winnerId.equals(match.getTeamB().getId())) {

                    throw new IllegalArgumentException(
                            "Winner must be one of the teams in this match"
                    );
                }

                Team winner = teamRepository
                        .findById(winnerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Winner team not found"
                                )
                        );

                match.setWinner(winner);

            } else {
                match.setWinner(null);
            }

        } else {
            match.setWinner(null);
        }

        match.setStatus(newStatus);

        if (oldStatus == MatchStatus.COMPLETED
                || newStatus == MatchStatus.COMPLETED) {

            standingService.recalculateStandings(
                    match.getSport().getId()
            );
        }

        matchWebSocketService.broadcastMatchUpdate(match);

        return toResponse(match);
    }

    public void deleteMatch(Long id) {

        Match match = findMatch(id);

        Long sportId = match.getSport().getId();

        boolean wasCompleted =
                match.getStatus() == MatchStatus.COMPLETED;

        matchRepository.delete(match);

        if (wasCompleted) {
            standingService.recalculateStandings(sportId);
        }

        matchWebSocketService.broadcastMatchUpdate(match);
    }

    private Match findMatch(Long id) {

        return matchRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Match not found with id: " + id
                        )
                );
    }

    private void validateTeams(
            Sport sport,
            Team teamA,
            Team teamB
    ) {

        if (teamA.getId().equals(teamB.getId())) {
            throw new IllegalArgumentException(
                    "A team cannot play against itself"
            );
        }

        if (!teamA.getSport().getId().equals(sport.getId())) {
            throw new IllegalArgumentException(
                    "Team A does not belong to this sport"
            );
        }

        if (!teamB.getSport().getId().equals(sport.getId())) {
            throw new IllegalArgumentException(
                    "Team B does not belong to this sport"
            );
        }
    }

    private void validateStatusTransition(
            MatchStatus oldStatus,
            MatchStatus newStatus
    ) {

        if (oldStatus == newStatus) {
            return;
        }

        if (oldStatus == MatchStatus.CANCELLED
                && newStatus != MatchStatus.UPCOMING) {

            throw new IllegalStateException(
                    "A cancelled match can only be reopened as UPCOMING"
            );
        }
    }

    private MatchResponse toResponse(Match match) {

        Team winner = match.getWinner();

        return new MatchResponse(
                match.getId(),

                match.getSport().getId(),
                match.getSport().getName(),

                match.getTeamA().getId(),
                match.getTeamA().getName(),
                match.getScoreA(),

                match.getTeamB().getId(),
                match.getTeamB().getName(),
                match.getScoreB(),

                match.getVenue(),
                match.getRoundName(),
                match.getScheduledAt(),

                match.getStatus(),

                winner != null
                        ? winner.getId()
                        : null,

                winner != null
                        ? winner.getName()
                        : null
        );
    }
}