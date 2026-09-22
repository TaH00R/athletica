import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/MatchCard";
import StandingsTable from "@/components/StandingsTable";
import LeaderboardList from "@/components/LeaderboardList";
import LiveMatches from "@/components/LiveMatches";

import { api } from "@/lib/api";

type SportPageProps = {
  params: Promise<{
    sportId: string;
  }>;
};

export default async function SportPage({ params }: SportPageProps) {
  const { sportId } = await params;
  const id = Number(sportId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const sport = await api.sports.getById(id);
  
  const [teams, liveMatches, matches, standings, leaderboard] =
    await Promise.all([
      api.teams.getBySport(id),
      api.matches.getLiveBySport(id),
      api.matches.getBySport(id),
      api.standings.getBySport(id),
      api.leaderboards.getBySport(id),
    ]);

  const upcomingMatches = matches.filter(
    (match) => match.status === "UPCOMING"
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] text-[#f4f0e5]">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-4xl">
              <p className="mono-font mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b] sm:text-sm">
                IIITG FRESHERS&apos; CUP
              </p>

              <h1 className="display-font text-6xl leading-[0.88] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
                {sport.name}
              </h1>

              {sport.description && (
                <p className="mono-font mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                  {sport.description}
                </p>
              )}
            </div>

            <Link
              href="/sports"
              className="mono-font w-fit text-sm font-bold uppercase tracking-wide text-white/65 transition-colors hover:text-[#ff625b]"
            >
              ← All Sports
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
                Teams
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              {teams.length} Teams
            </span>
          </div>

          {teams.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="group relative border border-white/20 bg-[#0a443a] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff625b] hover:bg-[#0d4b40] sm:p-6"
                >
                  <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
                  <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

                  <p className="mono-font text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                    TEAM {String(team.id).padStart(2, "0")}
                  </p>

                  <h3 className="mt-4 break-words text-2xl font-black uppercase tracking-tight text-[#f4f0e5] sm:text-3xl">
                    {team.name}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-14 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No teams available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                      ON THE BOARD
                    </p>

                    <h2 className="display-font text-4xl leading-none sm:text-5xl">
                      Live Now
                    </h2>
                  </div>

                  <span className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-[#ff625b]">
                    ● LIVE
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <LiveMatches initialMatches={liveMatches} />
              </div>
            </div>

            <div className="border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                  NEXT UP
                </p>

                <h2 className="display-font text-4xl leading-none sm:text-5xl">
                  Upcoming
                </h2>
              </div>

              <div className="match-stack p-4 sm:p-5">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.slice(0, 4).map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      compact
                    />
                  ))
                ) : (
                  <div className="px-2 py-10 text-center sm:px-4">
                    <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                      No upcoming matches.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                  CURRENT RANKINGS
                </p>

                <h2 className="display-font text-4xl leading-none sm:text-5xl">
                  Points Table
                </h2>
              </div>

              <div className="overflow-x-auto p-4 sm:p-5">
                <StandingsTable standings={standings} />
              </div>
            </div>

            <div className="min-w-0 border border-white/15 bg-[#0a443a]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                  PLAYER TOTALS
                </p>

                <h2 className="display-font text-4xl leading-none sm:text-5xl">
                  Top Performers
                </h2>
              </div>

              <div className="p-4 sm:p-5">
                <LeaderboardList
                  entries={leaderboard}
                  limit={6}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link
            href="/sports"
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            ← Browse All Sports
          </Link>

          <Link
            href="/schedule"
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            Full Schedule →
          </Link>
        </div>
      </section>
    </main>
  );
}