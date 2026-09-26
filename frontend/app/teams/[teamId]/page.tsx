import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/MatchCard";

import { api, ApiError } from "@/lib/api";

type TeamPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const id = Number(teamId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  let team;

  try {
    team = await api.teams.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const [players, matches] = await Promise.all([
    api.players.getByTeam(id),
    api.matches.getAll(),
  ]);

  const teamMatches = matches
    .filter(
      (match) =>
        match.teamAId === team.id || match.teamBId === team.id
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    );

  const upcomingMatches = teamMatches.filter(
    (match) => match.status === "UPCOMING"
  );

  const liveMatches = teamMatches.filter(
    (match) => match.status === "LIVE"
  );

  const completedMatches = teamMatches
    .filter((match) => match.status === "COMPLETED")
    .reverse();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] pt-20 text-[#f4f0e5]">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mono-font mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b] sm:text-sm">
                {team.sportName} · FRESHERS&apos; CUP
              </p>

              <h1 className="display-font break-words text-6xl leading-[0.88] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
                {team.name}
              </h1>

              <p className="mono-font mt-6 text-sm uppercase tracking-[0.12em] text-white/45 sm:text-base">
                TEAM {String(team.id).padStart(2, "0")}
              </p>
            </div>

            <Link
              href="/teams"
              className="mono-font w-fit shrink-0 text-sm font-bold uppercase tracking-wide text-white/65 transition-colors hover:text-[#ff625b]"
            >
              ← All Teams
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                THE ROSTER
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                Players
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              {players.length}{" "}
              {players.length === 1 ? "PLAYER" : "PLAYERS"}
            </span>
          </div>

          {players.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="relative min-w-0 border border-white/20 bg-[#0a443a] p-5 sm:p-6"
                >
                  <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
                  <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

                  <p className="mono-font text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                    PLAYER {String(index + 1).padStart(2, "0")}
                  </p>

                  <h3 className="mt-6 break-words text-2xl font-black uppercase leading-tight tracking-tight text-[#f4f0e5] sm:text-3xl">
                    {player.name}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-14 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No players registered yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8">
            <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
              MATCH DAY
            </p>

            <h2 className="display-font text-5xl leading-none sm:text-6xl">
              Fixtures
            </h2>
          </div>

          {liveMatches.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-[#ff625b]">
                  ● LIVE NOW
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <p className="mono-font mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff625b]">
                  NEXT UP
                </p>

                <h3 className="display-font text-4xl leading-none sm:text-5xl">
                  Upcoming
                </h3>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.slice(0, 5).map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      compact
                    />
                  ))
                ) : (
                  <p className="mono-font py-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                    No upcoming matches.
                  </p>
                )}
              </div>
            </div>

            <div className="border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <p className="mono-font mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff625b]">
                  RECENT RESULTS
                </p>

                <h3 className="display-font text-4xl leading-none sm:text-5xl">
                  Results
                </h3>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                {completedMatches.length > 0 ? (
                  completedMatches.slice(0, 5).map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      compact
                    />
                  ))
                ) : (
                  <p className="mono-font py-8 text-center text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                    No completed matches.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link
            href="/teams"
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            ← Browse Teams
          </Link>

          <Link
            href={`/sports/${team.sportId}`}
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            View {team.sportName} →
          </Link>
        </div>
      </section>
    </main>
  );
}