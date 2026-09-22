export type Team = {
  id: number;
  name: string;
  sportId: number;
  sportName: string;
};

export type TeamRequest = {
  name: string;
  sportId: number;
};