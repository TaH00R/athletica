package com.freshco.backend.dto;

public record SportResponse(
        Long id,
        String name,
        String description,
        String icon,
        Boolean active,
        Integer displayOrder,
        String primaryStat,
        Integer winPoints,
        Integer drawPoints,
        Integer lossPoints
) {
}