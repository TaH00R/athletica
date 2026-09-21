const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6967";

export async function getSports() {
  const response = await fetch(`${API_URL}/api/sports`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sports");
  }

  return response.json();
}

export async function getLiveMatches() {
  const response = await fetch(`${API_URL}/api/matches/live`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch live matches");
  }

  return response.json();
}