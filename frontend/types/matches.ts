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
  scoreA: string;
  teamBId: number;
  teamBName: string;
  scoreB: string;
  venue: string;
  roundName: string;
  scheduledAt: string;
  status: MatchStatus;
  winnerId: number | null;
  winnerName: string | null;
};