export type Sport = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  displayOrder: number;
  primaryStat: string | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
};

export type SportRequest = {
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  displayOrder: number;
  primaryStat: string | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
};