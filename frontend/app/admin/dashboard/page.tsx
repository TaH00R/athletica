import AdminDashboard from "@/components/admin/AdminDashboard";
import { api } from "@/lib/api";

export default async function AdminDashboardPage() {
  const [sports, teams, players, liveMatches, upcomingMatches] =
    await Promise.all([
      api.sports.getAll(),
      api.teams.getAll(),
      api.players.getAll(),
      api.matches.getLive(),
      api.matches.getUpcoming(),
    ]);

  return (
    <AdminDashboard
      sports={sports}
      teams={teams}
      players={players}
      liveMatches={liveMatches}
      upcomingMatches={upcomingMatches}
    />
  );
}