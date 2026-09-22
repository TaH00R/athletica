import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import StandingsTable from "@/components/StandingsTable";
import LeaderboardList from "@/components/LeaderboardList";

import { api } from "@/lib/api";

type LeaderboardPageProps = {
  searchParams: Promise<{
    sport?: string;
  }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const { sport } = await searchParams;

  const sports = await api.sports.getActive();

  const orderedSports = [...sports].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const requestedSportId = sport ? Number(sport) : NaN;

  const selectedSport =
    orderedSports.find((item) => item.id === requestedSportId) ||
    orderedSports[0];

  const [standings, leaderboard] = selectedSport
    ? await Promise.all([
        api.standings.getBySport(selectedSport.id),
        api.leaderboards.getBySport(selectedSport.id),
      ])
    : [[], []];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] text-[#f4f0e5]">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="mono-font mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b] sm:text-sm">
                IIITG FRESHERS&apos; CUP
              </p>

              <h1 className="display-font text-6xl leading-[0.88] tracking-tight sm:text-7xl md:text-8xl">
                LEADERBOARD
              </h1>

              <p className="mono-font mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Team standings and individual performances across the cup.
              </p>
            </div>

            <Link
              href="/"
              className="mono-font w-fit text-sm font-bold uppercase tracking-wide text-white/65 transition-colors hover:text-[#ff625b]"
            >
              ← Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {orderedSports.map((item) => (
              <Link
                key={item.id}
                href={`/leaderboard?sport=${item.id}`}
                className={`mono-font shrink-0 border px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-colors sm:px-5 ${
                  selectedSport?.id === item.id
                    ? "border-[#ff625b] bg-[#ff625b] text-black"
                    : "border-white/20 bg-[#0a443a] text-white/60 hover:border-[#ff625b] hover:text-[#ff625b]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {selectedSport ? (
        <>
          <section className="border-b border-white/10">
            <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                    {selectedSport.name}
                  </p>

                  <h2 className="display-font text-5xl leading-none sm:text-6xl">
                    Points Table
                  </h2>
                </div>

                <Link
                  href={`/sports/${selectedSport.id}`}
                  className="mono-font w-fit text-xs font-bold uppercase tracking-wide text-white/50 transition-colors hover:text-[#ff625b]"
                >
                  View Sport →
                </Link>
              </div>

              <div className="overflow-x-auto border border-white/15 bg-[#0a443a] p-3 sm:p-5">
                <StandingsTable standings={standings} />
              </div>
            </div>
          </section>

          <section>
            <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
              <div className="mb-8">
                <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                  PLAYER PERFORMANCE
                </p>

                <h2 className="display-font text-5xl leading-none sm:text-6xl">
                  Top Performers
                </h2>
              </div>

              <div className="border border-white/15 bg-[#0a443a] px-4 sm:px-6">
                <LeaderboardList
                  entries={leaderboard}
                  limit={10}
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <section>
          <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10">
            <div className="border border-white/15 bg-[#0a443a] px-6 py-16 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No sports available yet.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}