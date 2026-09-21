package com.freshco.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    private String icon;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String primaryStat = "POINTS";

    @Column(nullable = false)
    @Builder.Default
    private Integer winPoints = 3;

    @Column(nullable = false)
    @Builder.Default
    private Integer drawPoints = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer lossPoints = 0;
}