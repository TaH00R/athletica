package com.freshco.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "player_stats",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_player_match_stat",
                        columnNames = {"player_id", "match_id", "stat_type"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "stat_type", nullable = false, length = 50)
    private String statType;

    @Column(nullable = false)
    private Double value;
}