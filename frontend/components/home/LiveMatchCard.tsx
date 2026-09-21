import Link from "next/link";
import { getLiveMatches } from "@/lib/api";
import type { Match } from "@/types/matches";

export default async function LiveMatchCard() {
  let matches: Match[] = [];

  try {
    matches = await getLiveMatches();
  } catch {
    matches = [];
  }

  const match = matches[0];

  if (!match) {
    return (
      <div className="relative w-full max-w-[500px] overflow-hidden border-2 border-[#d7dfd3]/35 bg-[#104c41] text-[#f4f0e5] shadow-[7px_7px_0_#041f1b]">
        <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
        <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

        <div className="border-b border-[#d7dfd3]/20 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#ff625b] opacity-60" />
              <span className="relative h-4 w-4 rounded-full bg-[#ff625b]" />
            </span>

            <span className="mono-font text-[13px] font-bold uppercase tracking-[0.14em] text-[#ff625b] sm:text-sm">
              Live Matches
            </span>
          </div>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="display-font text-4xl uppercase sm:text-5xl">
            No Live Matches
          </div>

          <p className="mono-font mt-4 max-w-sm text-sm leading-6 text-[#f4f0e5]/65 sm:text-base">
            There are no matches in progress right now.
          </p>

          <Link
            href="/matches"
            className="mt-7 border-2 border-[#ff625b] px-6 py-4 mono-font text-[12px] font-bold uppercase tracking-[0.1em] text-[#f4f0e5] transition-colors hover:bg-[#ff625b] hover:text-[#041f1b]"
          >
            View Schedule →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[500px] overflow-hidden border-2 border-[#d7dfd3]/40 bg-[#104c41] text-[#f4f0e5] shadow-[7px_7px_0_#041f1b]">
      <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
      <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

      <div className="flex items-center justify-between gap-4 border-b border-[#d7dfd3]/20 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#ff625b] opacity-60" />
            <span className="relative h-4 w-4 rounded-full bg-[#ff625b]" />
          </span>

          <span className="mono-font text-[13px] font-bold uppercase tracking-[0.14em] text-[#ff625b] sm:text-sm">
            Live Now
          </span>
        </div>

        <span className="mono-font text-[11px] font-bold uppercase tracking-[0.08em] text-[#f4f0e5]/75 sm:text-xs">
          {match.sportName} · {match.roundName}
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="mono-font text-[11px] font-bold uppercase tracking-[0.12em] text-[#f4f0e5]/65 sm:text-xs">
            Match {String(match.id).padStart(2, "0")}
          </span>

          <span className="mono-font text-[11px] font-bold uppercase tracking-[0.12em] text-[#f4f0e5]/65 sm:text-xs">
            {match.venue}
          </span>
        </div>

        <div className="border-y border-[#d7dfd3]/20">
          <div className="flex items-center justify-between gap-5 py-6">
            <div className="min-w-0">
              <div className="display-font truncate text-3xl tracking-tight sm:text-4xl">
                {match.teamAName}
              </div>

              <div className="mono-font mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f4f0e5]/65 sm:text-xs">
                Team A
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="display-font text-4xl leading-none sm:text-5xl">
                {match.scoreA}
              </div>
            </div>
          </div>

          <div className="border-t border-[#d7dfd3]/15" />

          <div className="flex items-center justify-between gap-5 py-6">
            <div className="min-w-0">
              <div className="display-font truncate text-3xl tracking-tight sm:text-4xl">
                {match.teamBName}
              </div>

              <div className="mono-font mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f4f0e5]/65 sm:text-xs">
                Team B
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="display-font text-4xl leading-none sm:text-5xl">
                {match.scoreB}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-b border-[#d7dfd3]/15 pb-5">
          <span className="mono-font text-[12px] font-bold uppercase tracking-[0.08em] text-[#79e0ad] sm:text-[13px]">
            Match In Progress
          </span>

          <span className="mono-font text-[11px] font-bold uppercase tracking-[0.1em] text-[#f4f0e5]/60 sm:text-xs">
            LIVE
          </span>
        </div>

        <Link
          href={`/matches/${match.id}`}
          className="mt-5 flex items-center justify-between border-2 border-[#ff625b] bg-[#ff625b] px-5 py-4 text-[#041f1b] shadow-[4px_4px_0_#041f1b] transition-transform hover:-translate-y-0.5"
        >
          <span className="mono-font text-[12px] font-bold uppercase tracking-[0.12em] sm:text-[13px]">
            Watch Live
          </span>

          <span className="text-xl">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}