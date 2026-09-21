package com.freshco.backend.service;

import com.freshco.backend.dto.PlayerStatRequest;
import com.freshco.backend.dto.PlayerStatResponse;
import com.freshco.backend.entity.Match;
import com.freshco.backend.entity.Player;
import com.freshco.backend.entity.PlayerStat;
import com.freshco.backend.repository.MatchRepository;
import com.freshco.backend.repository.PlayerRepository;
import com.freshco.backend.repository.PlayerStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PlayerStatService {

    private final PlayerStatRepository playerStatRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    @Transactional(readOnly = true)
    public List<PlayerStatResponse> getAllStats() {

        return playerStatRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlayerStatResponse getStatById(Long id) {

        PlayerStat stat = findStat(id);

        return toResponse(stat);
    }

    @Transactional(readOnly = true)
    public List<PlayerStatResponse> getStatsByPlayer(Long playerId) {

        if (!playerRepository.existsById(playerId)) {
            throw new RuntimeException(
                    "Player not found with id: " + playerId
            );
        }

        return playerStatRepository.findByPlayerId(playerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerStatResponse> getStatsByMatch(Long matchId) {

        if (!matchRepository.existsById(matchId)) {
            throw new RuntimeException(
                    "Match not found with id: " + matchId
            );
        }

        return playerStatRepository.findByMatchId(matchId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerStatResponse> getStatsByMatchAndType(
            Long matchId,
            String statType
    ) {

        if (!matchRepository.existsById(matchId)) {
            throw new RuntimeException(
                    "Match not found with id: " + matchId
            );
        }

        return playerStatRepository
                .findByMatchIdAndStatTypeIgnoreCase(matchId, statType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PlayerStatResponse createOrUpdateStat(
            PlayerStatRequest request
    ) {

        Player player = playerRepository.findById(request.playerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Player not found with id: "
                                        + request.playerId()
                        )
                );

        Match match = matchRepository.findById(request.matchId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Match not found with id: "
                                        + request.matchId()
                        )
                );

        validatePlayerAndMatch(player, match);

        PlayerStat stat = playerStatRepository
                .findByPlayerIdAndMatchIdAndStatTypeIgnoreCase(
                        request.playerId(),
                        request.matchId(),
                        request.statType()
                )
                .orElseGet(() ->
                        PlayerStat.builder()
                                .player(player)
                                .match(match)
                                .statType(request.statType().trim().toUpperCase())
                                .build()
                );

        stat.setValue(request.value());

        return toResponse(playerStatRepository.save(stat));
    }

    public void deleteStat(Long id) {

        if (!playerStatRepository.existsById(id)) {
            throw new RuntimeException(
                    "Player stat not found with id: " + id
            );
        }

        playerStatRepository.deleteById(id);
    }

    private void validatePlayerAndMatch(
            Player player,
            Match match
    ) {

        Long playerTeamId = player.getTeam().getId();

        boolean participating =
                playerTeamId.equals(match.getTeamA().getId())
                        || playerTeamId.equals(match.getTeamB().getId());

        if (!participating) {
            throw new IllegalArgumentException(
                    "Player does not belong to either team in this match"
            );
        }

        if (!player.getTeam().getSport().getId()
                .equals(match.getSport().getId())) {

            throw new IllegalArgumentException(
                    "Player's sport does not match the match sport"
            );
        }
    }

    private PlayerStat findStat(Long id) {

        return playerStatRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Player stat not found with id: " + id
                        )
                );
    }

    private PlayerStatResponse toResponse(PlayerStat stat) {

        Player player = stat.getPlayer();

        return new PlayerStatResponse(
                stat.getId(),

                player.getId(),
                player.getName(),

                player.getTeam().getId(),
                player.getTeam().getName(),

                player.getTeam().getSport().getId(),
                player.getTeam().getSport().getName(),

                stat.getMatch().getId(),

                stat.getStatType(),
                stat.getValue()
        );
    }
}