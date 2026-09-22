const sportImages: Record<string, string> = {
  cricket: "/images/sports/cricket.png",
  football: "/images/sports/football.png",
  volleyball: "/images/sports/volleyball.png",
  basketball: "/images/sports/basketball.png",
  "basketball male": "/images/sports/basketball.png",
  "basketball female": "/images/sports/basketball.png",
  badminton: "/images/sports/badminton.png",
  "badminton male": "/images/sports/badminton.png",
  "badminton female": "/images/sports/badminton.png",
  "table tennis": "/images/sports/table-tennis.png",
  "table tennis male": "/images/sports/table-tennis.png",
  "table tennis female": "/images/sports/table-tennis.png",
  tennis: "/images/sports/tennis.png",
  "tennis male": "/images/sports/tennis.png",
  "tennis female": "/images/sports/tennis.png",
  "lawn tennis": "/images/sports/tennis.png",
  "lawn tennis male": "/images/sports/tennis.png",
  "lawn tennis female": "/images/sports/tennis.png",
  chess: "/images/sports/chess.png",
  "chess male": "/images/sports/chess.png",
  "chess female": "/images/sports/chess.png",
  carrom: "/images/sports/carrom.png",
  "carrom male": "/images/sports/carrom.png",
  "carrom female": "/images/sports/carrom.png",
};

export const normalizeSportName = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[()_-]/g, " ")
    .replace(/\bgirls\b/g, "female")
    .replace(/\bboys\b/g, "male")
    .replace(/\bwomen\b/g, "female")
    .replace(/\bwoman\b/g, "female")
    .replace(/\bmen\b/g, "male")
    .replace(/\bman\b/g, "male")
    .replace(/\s+/g, " ");
};

export const getSportImage = (name: string) => {
  const normalized = normalizeSportName(name);

  if (sportImages[normalized]) {
    return sportImages[normalized];
  }

  if (normalized.includes("basketball")) {
    return "/images/sports/basketball.png";
  }

  if (normalized.includes("volleyball")) {
    return "/images/sports/volleyball.png";
  }

  if (normalized.includes("cricket")) {
    return "/images/sports/cricket.png";
  }

  if (normalized.includes("football")) {
    return "/images/sports/football.png";
  }

  if (
    normalized.includes("table tennis") ||
    normalized.includes("ping pong")
  ) {
    return "/images/sports/table-tennis.png";
  }

  if (normalized.includes("lawn tennis") || normalized.includes("tennis")) {
    return "/images/sports/tennis.png";
  }

  if (normalized.includes("badminton")) {
    return "/images/sports/badminton.png";
  }

  if (normalized.includes("chess")) {
    return "/images/sports/chess.png";
  }

  if (normalized.includes("carrom")) {
    return "/images/sports/carrom.png";
  }

  return undefined;
};