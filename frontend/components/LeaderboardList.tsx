import type { LeaderboardEntry } from "@/types/leaderboard";

type LeaderboardListProps = {
  entries: LeaderboardEntry[];
  limit?: number;
};

export default function LeaderboardList({
  entries,
  limit,
}: LeaderboardListProps) {
  const visibleEntries = limit
    ? entries.slice(0, limit)
    : entries;

  if (!visibleEntries.length) {
    return (
      <div className="py-10 text-center">
        <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/40">
          No player statistics available.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {visibleEntries.map((entry, index) => (
        <div
          key={`${entry.playerId}-${entry.statType}`}
          className="flex items-center gap-4 py-4"
        >
          <span className="mono-font w-8 shrink-0 text-sm font-black text-[#ff625b]">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black uppercase text-[#f4f0e5]">
              {entry.playerName}
            </p>

            <p className="mono-font mt-1 truncate text-[10px] uppercase tracking-[0.1em] text-white/35">
              {entry.teamName} · {entry.statType}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="mono-font text-xl font-black text-[#f4b93f]">
              {entry.totalValue}
            </p>

            <p className="mono-font text-[9px] uppercase tracking-[0.1em] text-white/30">
              Total
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}