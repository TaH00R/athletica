import type { Match } from "@/types/matches";

type MatchCardProps = {
  match: Match;
  compact?: boolean;
};

function formatMatchDate(date: string) {
  const value = new Date(date);

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMatchTime(date: string) {
  const value = new Date(date);

  return value.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({
  match,
  compact = false,
}: MatchCardProps) {
  return (
    <div
      className={`relative overflow-hidden border border-white/15 bg-[#0d4b40] ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#ff625b]" />
      <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#f4b93f]" />
      <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#f4b93f]" />
      <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#ff625b]" />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-font truncate text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
            {match.roundName || "MATCH"}
          </p>

          <p className="mono-font mt-1 text-xs uppercase text-white/50">
            {formatMatchDate(match.scheduledAt)} ·{" "}
            {formatMatchTime(match.scheduledAt)}
          </p>
        </div>

        <span
          className={`mono-font shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] ${
            match.status === "LIVE"
              ? "text-[#ff625b]"
              : match.status === "COMPLETED"
                ? "text-white/40"
                : "text-[#f4b93f]"
          }`}
        >
          {match.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0">
          <p className="break-words text-base font-black uppercase leading-tight text-[#f4f0e5] sm:text-lg">
            {match.teamAName}
          </p>

          <p className="mono-font mt-1 text-[10px] uppercase text-white/35">
            TEAM A
          </p>
        </div>

        <div className="text-center">
          <div className="mono-font text-xs font-bold text-white/35">
            VS
          </div>

          {match.status !== "UPCOMING" && (
            <div className="mono-font mt-1 text-xl font-black text-[#f4f0e5]">
              {match.scoreA} - {match.scoreB}
            </div>
          )}
        </div>

        <div className="min-w-0 text-right">
          <p className="break-words text-base font-black uppercase leading-tight text-[#f4f0e5] sm:text-lg">
            {match.teamBName}
          </p>

          <p className="mono-font mt-1 text-[10px] uppercase text-white/35">
            TEAM B
          </p>
        </div>
      </div>

      {(match.venue || match.winnerName) && (
        <div className="mt-5 flex flex-col gap-1 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {match.venue && (
            <p className="mono-font text-[10px] uppercase tracking-[0.1em] text-white/40">
              {match.venue}
            </p>
          )}

          {match.winnerName && (
            <p className="mono-font text-[10px] font-bold uppercase tracking-[0.1em] text-[#f4b93f]">
              WINNER · {match.winnerName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}