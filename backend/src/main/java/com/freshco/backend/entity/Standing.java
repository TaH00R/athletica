package com.freshco.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "standings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_standing_team",
                        columnNames = {"team_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Standing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "team_id",
            nullable = false,
            unique = true
    )
    private Team team;

    @Column(nullable = false)
    @Builder.Default
    private Integer played = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer wins = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer losses = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer draws = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;
}