import MatchCard from "./MatchCard";
import type { Match } from "@/types/matches";

type LiveMatchesProps = {
  initialMatches: Match[];
};

export default function LiveMatches({
  initialMatches,
}: LiveMatchesProps) {
  if (!initialMatches.length) {
    return (
      <div className="py-10 text-center">
        <div className="mono-font text-2xl font-black text-white/20">
          00
        </div>

        <p className="mono-font mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
          No live matches right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initialMatches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
        />
      ))}
    </div>
  );
}