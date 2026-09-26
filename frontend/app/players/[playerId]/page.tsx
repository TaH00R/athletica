import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/MatchCard";

import { api, ApiError } from "@/lib/api";

type PlayerPageProps = {
  params: Promise<{
    playerId: string;
  }>;
};

export default async function PlayerPage({
  params,
}: PlayerPageProps) {
  const { playerId } = await params;
  const id = Number(playerId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  let player;

  try {
    player = await api.players.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const [stats, matches] = await Promise.all([
    api.stats.getByPlayer(id),
    api.matches.getAll(),
  ]);

  const teamMatches = matches
    .filter(
      (match) =>
        match.teamAId === player.teamId ||
        match.teamBId === player.teamId
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() -
        new Date(a.scheduledAt).getTime()
    );

  const statsByType = stats.reduce<Record<string, number>>(
    (groups, stat) => {
      groups[stat.statType] =
        (groups[stat.statType] || 0) + stat.value;

      return groups;
    },
    {}
  );

  const statEntries = Object.entries(statsByType);

  const statMatches = stats
    .map((stat) => matches.find((match) => match.id === stat.matchId))
    .filter(
      (match, index, array) =>
        match &&
        array.findIndex((item) => item?.id === match.id) === index
    )
    .sort(
      (a, b) =>
        new Date(b!.scheduledAt).getTime() -
        new Date(a!.scheduledAt).getTime()
    ) as typeof matches;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] pt-20 text-[#f4f0e5]">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mono-font mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b] sm:text-sm">
                {player.teamName} · PLAYER PROFILE
              </p>

              <h1 className="display-font break-words text-6xl leading-[0.88] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
                {player.name}
              </h1>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <p className="mono-font text-xs uppercase tracking-[0.12em] text-white/45 sm:text-sm">
                  TEAM {String(player.teamId).padStart(2, "0")}
                </p>

                <p className="mono-font text-xs uppercase tracking-[0.12em] text-white/45 sm:text-sm">
                  PLAYER {String(player.id).padStart(2, "0")}
                </p>
              </div>
            </div>

            <Link
              href="/players"
              className="mono-font w-fit shrink-0 text-sm font-bold uppercase tracking-wide text-white/65 transition-colors hover:text-[#ff625b]"
            >
              ← All Players
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8">
            <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
              PLAYER TOTALS
            </p>

            <h2 className="display-font text-5xl leading-none sm:text-6xl">
              Statistics
            </h2>
          </div>

          {statEntries.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {statEntries.map(([statType, value]) => (
                <div
                  key={statType}
                  className="relative min-w-0 border border-white/20 bg-[#0a443a] p-5 sm:p-6"
                >
                  <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
                  <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
                  <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

                  <p className="mono-font truncate text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {statType}
                  </p>

                  <p className="mt-5 text-4xl font-black text-[#f4f0e5] sm:text-5xl">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-14 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No statistics recorded yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                APPEARANCES
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                Matches
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              {teamMatches.length}{" "}
              {teamMatches.length === 1 ? "MATCH" : "MATCHES"}
            </span>
          </div>

          {teamMatches.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {teamMatches.slice(0, 8).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-14 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No matches recorded yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8">
            <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
              STAT RECORD
            </p>

            <h2 className="display-font text-5xl leading-none sm:text-6xl">
              Match Stats
            </h2>
          </div>

          {stats.length > 0 ? (
            <div className="overflow-x-auto border border-white/15 bg-[#0a443a]">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                      Match
                    </th>

                    <th className="px-4 py-4 text-left mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                      Stat
                    </th>

                    <th className="px-4 py-4 text-right mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                      Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stats.map((stat) => {
                    const match = matches.find(
                      (item) => item.id === stat.matchId
                    );

                    return (
                      <tr
                        key={stat.id}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-black uppercase text-[#f4f0e5]">
                            {match
                              ? `${match.teamAName} vs ${match.teamBName}`
                              : `MATCH #${stat.matchId}`}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="mono-font text-xs uppercase text-white/55">
                            {stat.statType}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <p className="mono-font text-sm font-black text-[#f4b93f]">
                            {stat.value}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-14 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No match statistics available.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Link
            href={`/teams/${player.teamId}`}
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            ← View Team
          </Link>

          <Link
            href="/players"
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            Browse Players →
          </Link>
        </div>
      </section>
    </main>
  );
}