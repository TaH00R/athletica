package com.freshco.backend.dto;

public record StandingResponse(

        Integer rank,

        Long teamId,
        String teamName,

        Integer played,
        Integer wins,
        Integer losses,
        Integer draws,
        Integer points
) {
}