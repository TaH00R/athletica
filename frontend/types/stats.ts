export type PlayerStat = {
  id: number;
  playerId: number;
  playerName: string;
  matchId: number;
  statType: string;
  value: number;
};

export type PlayerStatRequest = {
  playerId: number;
  matchId: number;
  statType: string;
  value: number;
};