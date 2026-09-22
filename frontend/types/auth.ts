export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  username: string;
  role: string;
};
