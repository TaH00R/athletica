CREATE TABLE sports (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL UNIQUE,
                        description VARCHAR(1000),
                        icon VARCHAR(255),
                        active BOOLEAN NOT NULL DEFAULT TRUE,
                        display_order INTEGER NOT NULL DEFAULT 0,
                        primary_stat VARCHAR(50) NOT NULL DEFAULT 'POINTS',
                        win_points INTEGER NOT NULL DEFAULT 3,
                        draw_points INTEGER NOT NULL DEFAULT 1,
                        loss_points INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE teams (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       logo VARCHAR(255),
                       sport_id BIGINT NOT NULL,

                       CONSTRAINT fk_team_sport
                           FOREIGN KEY (sport_id)
                               REFERENCES sports(id)
);


CREATE TABLE players (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL,
                         jersey_number INTEGER,
                         image VARCHAR(255),
                         active BOOLEAN NOT NULL DEFAULT TRUE,
                         team_id BIGINT NOT NULL,

                         CONSTRAINT fk_player_team
                             FOREIGN KEY (team_id)
                                 REFERENCES teams(id)
);


CREATE TABLE admins (
                        id BIGSERIAL PRIMARY KEY,
                        username VARCHAR(100) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL,
                        role VARCHAR(255) NOT NULL,
                        enabled BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE matches (
                         id BIGSERIAL PRIMARY KEY,
                         sport_id BIGINT NOT NULL,
                         team_a_id BIGINT NOT NULL,
                         team_b_id BIGINT NOT NULL,

                         score_a VARCHAR(255) NOT NULL DEFAULT '0',
                         score_b VARCHAR(255) NOT NULL DEFAULT '0',

                         venue VARCHAR(255),
                         round_name VARCHAR(255),
                         scheduled_at TIMESTAMP,

                         status VARCHAR(255) NOT NULL DEFAULT 'UPCOMING',

                         winner_id BIGINT,

                         CONSTRAINT fk_match_sport
                             FOREIGN KEY (sport_id)
                                 REFERENCES sports(id),

                         CONSTRAINT fk_match_team_a
                             FOREIGN KEY (team_a_id)
                                 REFERENCES teams(id),

                         CONSTRAINT fk_match_team_b
                             FOREIGN KEY (team_b_id)
                                 REFERENCES teams(id),

                         CONSTRAINT fk_match_winner
                             FOREIGN KEY (winner_id)
                                 REFERENCES teams(id)
);


CREATE TABLE player_stats (
                              id BIGSERIAL PRIMARY KEY,

                              player_id BIGINT NOT NULL,
                              match_id BIGINT NOT NULL,

                              stat_type VARCHAR(50) NOT NULL,
                              value DOUBLE PRECISION NOT NULL,

                              CONSTRAINT fk_player_stat_player
                                  FOREIGN KEY (player_id)
                                      REFERENCES players(id),

                              CONSTRAINT fk_player_stat_match
                                  FOREIGN KEY (match_id)
                                      REFERENCES matches(id),

                              CONSTRAINT uk_player_match_stat
                                  UNIQUE (player_id, match_id, stat_type)
);


CREATE TABLE standings (
                           id BIGSERIAL PRIMARY KEY,

                           team_id BIGINT NOT NULL UNIQUE,

                           played INTEGER NOT NULL DEFAULT 0,
                           wins INTEGER NOT NULL DEFAULT 0,
                           losses INTEGER NOT NULL DEFAULT 0,
                           draws INTEGER NOT NULL DEFAULT 0,
                           points INTEGER NOT NULL DEFAULT 0,

                           CONSTRAINT fk_standing_team
                               FOREIGN KEY (team_id)
                                   REFERENCES teams(id)
);