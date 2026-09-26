import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/MatchCard";
import LiveMatches from "@/components/LiveMatches";

import { api } from "@/lib/api";

export default async function MatchesPage() {
  const [liveMatches, upcomingMatches, completedMatches] =
    await Promise.all([
      api.matches.getLive(),
      api.matches.getUpcoming(),
      api.matches.getCompleted(),
    ]);

  const sortedUpcoming = [...upcomingMatches].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() -
      new Date(b.scheduledAt).getTime()
  );

  const sortedCompleted = [...completedMatches].sort(
    (a, b) =>
      new Date(b.scheduledAt).getTime() -
      new Date(a.scheduledAt).getTime()
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] pt-20 text-[#f4f0e5]">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="mono-font mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b] sm:text-sm">
                IIITG FRESHERS&apos; CUP
              </p>

              <h1 className="display-font text-6xl leading-[0.88] tracking-tight sm:text-7xl md:text-8xl">
                MATCH DAY
              </h1>

              <p className="mono-font mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Live scores, upcoming fixtures, and results from
                across the cup.
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
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                RIGHT NOW
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                Live
              </h2>
            </div>

            <span className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-[#ff625b]">
              ● {liveMatches.length} LIVE
            </span>
          </div>

          <LiveMatches initialMatches={liveMatches} />
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                COMING UP
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                Upcoming
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              {sortedUpcoming.length}{" "}
              {sortedUpcoming.length === 1 ? "MATCH" : "MATCHES"}
            </span>
          </div>

          {sortedUpcoming.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedUpcoming.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                />
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-16 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No upcoming matches.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff625b]">
                THE RECORD
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                Results
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              {sortedCompleted.length}{" "}
              {sortedCompleted.length === 1 ? "MATCH" : "MATCHES"}
            </span>
          </div>

          {sortedCompleted.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedCompleted.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-16 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No results yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}