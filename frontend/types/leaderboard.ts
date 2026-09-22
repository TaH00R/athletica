export type LeaderboardEntry = {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  statType: string;
  totalValue: number;
  rank?: number;
};