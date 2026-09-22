import type {
  AuthResponse,
  LeaderboardEntry,
  LoginRequest,
  Match,
  Player,
  PlayerStat,
  Sport,
  Standing,
  Team,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6967";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(
      message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function encode(value: string | number): string {
  return encodeURIComponent(String(value));
}

export const api = {
  auth: {
    login(requestBody: LoginRequest): Promise<AuthResponse> {
      return request<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    },
  },

  sports: {
    getAll(): Promise<Sport[]> {
      return request<Sport[]>("/api/sports");
    },

    getActive(): Promise<Sport[]> {
      return request<Sport[]>("/api/sports/active");
    },

    getById(id: number): Promise<Sport> {
      return request<Sport>(`/api/sports/${encode(id)}`);
    },
  },

  teams: {
    getAll(): Promise<Team[]> {
      return request<Team[]>("/api/teams");
    },

    getById(id: number): Promise<Team> {
      return request<Team>(`/api/teams/${encode(id)}`);
    },

    getBySport(sportId: number): Promise<Team[]> {
      return request<Team[]>(`/api/teams/sport/${encode(sportId)}`);
    },
  },

  players: {
    getAll(): Promise<Player[]> {
      return request<Player[]>("/api/players");
    },

    getById(id: number): Promise<Player> {
      return request<Player>(`/api/players/${encode(id)}`);
    },

    getByTeam(teamId: number): Promise<Player[]> {
      return request<Player[]>(`/api/players/team/${encode(teamId)}`);
    },

    getActiveByTeam(teamId: number): Promise<Player[]> {
      return request<Player[]>(`/api/players/team/${encode(teamId)}/active`);
    },
  },

  matches: {
    getAll(): Promise<Match[]> {
      return request<Match[]>("/api/matches");
    },

    getById(id: number): Promise<Match> {
      return request<Match>(`/api/matches/${encode(id)}`);
    },

    getLive(): Promise<Match[]> {
      return request<Match[]>("/api/matches/live");
    },

    getUpcoming(): Promise<Match[]> {
      return request<Match[]>("/api/matches/upcoming");
    },

    getCompleted(): Promise<Match[]> {
      return request<Match[]>("/api/matches/completed");
    },

    getBySport(sportId: number): Promise<Match[]> {
      return request<Match[]>(`/api/matches/sport/${encode(sportId)}`);
    },

    getLiveBySport(sportId: number): Promise<Match[]> {
      return request<Match[]>(`/api/matches/sport/${encode(sportId)}/live`);
    },
  },

  stats: {
    getAll(): Promise<PlayerStat[]> {
      return request<PlayerStat[]>("/api/player-stats");
    },

    getById(id: number): Promise<PlayerStat> {
      return request<PlayerStat>(`/api/player-stats/${encode(id)}`);
    },

    getByPlayer(playerId: number): Promise<PlayerStat[]> {
      return request<PlayerStat[]>(`/api/player-stats/player/${encode(playerId)}`);
    },

    getByMatch(matchId: number): Promise<PlayerStat[]> {
      return request<PlayerStat[]>(`/api/player-stats/match/${encode(matchId)}`);
    },

    getByMatchAndType(matchId: number, statType: string): Promise<PlayerStat[]> {
      return request<PlayerStat[]>(
        `/api/player-stats/match/${encode(matchId)}/type/${encode(statType)}`
      );
    },
  },

  standings: {
    getBySport(sportId: number): Promise<Standing[]> {
      return request<Standing[]>(`/api/standings/${encode(sportId)}`);
    },
  },

  leaderboards: {
    getBySport(sportId: number): Promise<LeaderboardEntry[]> {
      return request<LeaderboardEntry[]>(`/api/leaderboards/${encode(sportId)}`);
    },

    getTop(
      sportId: number,
      options: { statType?: string; limit?: number } = {}
    ): Promise<LeaderboardEntry[]> {
      const params = new URLSearchParams();

      if (options.statType) {
        params.set("statType", options.statType);
      }

      if (options.limit !== undefined) {
        params.set("limit", String(options.limit));
      }

      const query = params.toString();
      const path = `/api/leaderboards/${encode(sportId)}/top${query ? `?${query}` : ""}`;

      return request<LeaderboardEntry[]>(path);
    },
  },
};

export type Api = typeof api;
