export type MatchStatus =
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type Match = {
  id: number;
  sportId: number;
  sportName: string;
  teamAId: number;
  teamAName: string;
  scoreA: number;
  teamBId: number;
  teamBName: string;
  scoreB: number;
  venue: string | null;
  roundName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  winnerId: number | null;
  winnerName: string | null;
};

export type MatchCreateRequest = {
  sportId: number;
  teamAId: number;
  teamBId: number;
  scoreA: number;
  scoreB: number;
  venue: string | null;
  roundName: string | null;
  scheduledAt: string;
  status: MatchStatus;
};

export type MatchScoreRequest = {
  scoreA: number;
  scoreB: number;
};

export type MatchStatusRequest = {
  status: MatchStatus;
};