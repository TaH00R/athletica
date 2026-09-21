package com.freshco.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SportRequest(

        @NotBlank(message = "Sport name is required")
        @Size(max = 100, message = "Sport name cannot exceed 100 characters")
        String name,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        String icon,

        Boolean active,

        Integer displayOrder
) {
}
