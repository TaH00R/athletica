package com.freshco.backend.dto;

import jakarta.validation.constraints.*;

public record SportRequest(

        @NotBlank(message = "Sport name is required")
        @Size(max = 100, message = "Sport name cannot exceed 100 characters")
        String name,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        String icon,

        Boolean active,

        @Min(value = 0, message = "Display order cannot be negative")
        Integer displayOrder,

        @Size(max = 50, message = "Primary stat cannot exceed 50 characters")
        String primaryStat,

        @Min(value = 0, message = "Win points cannot be negative")
        Integer winPoints,

        @Min(value = 0, message = "Draw points cannot be negative")
        Integer drawPoints,

        @Min(value = 0, message = "Loss points cannot be negative")
        Integer lossPoints
) {
}