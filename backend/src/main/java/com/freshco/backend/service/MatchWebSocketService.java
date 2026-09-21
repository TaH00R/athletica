package com.freshco.backend.service;

import com.freshco.backend.dto.MatchUpdateMessage;
import com.freshco.backend.entity.Match;
import com.freshco.backend.entity.Team;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MatchWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastMatchUpdate(Match match) {

        Team winner = match.getWinner();

        MatchUpdateMessage message = new MatchUpdateMessage(
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

        messagingTemplate.convertAndSend(
                "/topic/matches/" + match.getId(),
                message
        );

        messagingTemplate.convertAndSend(
                "/topic/matches",
                message
        );
    }
}