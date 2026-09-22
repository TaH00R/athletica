import type { Standing } from "@/types/standings";

type StandingsTableProps = {
  standings: Standing[];
};

export default function StandingsTable({
  standings,
}: StandingsTableProps) {
  if (!standings.length) {
    return (
      <div className="py-10 text-center">
        <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/40">
          No standings available.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[520px] border-collapse">
      <thead>
        <tr className="border-b border-white/15">
          <th className="px-3 py-3 text-left mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            #
          </th>
          <th className="px-3 py-3 text-left mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            Team
          </th>
          <th className="px-3 py-3 text-center mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            P
          </th>
          <th className="px-3 py-3 text-center mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            W
          </th>
          <th className="px-3 py-3 text-center mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            D
          </th>
          <th className="px-3 py-3 text-center mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            L
          </th>
          <th className="px-3 py-3 text-center mono-font text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
            PTS
          </th>
        </tr>
      </thead>

      <tbody>
        {standings.map((standing, index) => (
          <tr
            key={standing.id}
            className="border-b border-white/10 last:border-b-0"
          >
            <td className="px-3 py-4 mono-font text-xs font-bold text-[#ff625b]">
              {String(index + 1).padStart(2, "0")}
            </td>

            <td className="max-w-[220px] px-3 py-4 text-sm font-black uppercase text-[#f4f0e5]">
              {standing.teamName}
            </td>

            <td className="px-3 py-4 text-center mono-font text-xs text-white/60">
              {standing.played}
            </td>

            <td className="px-3 py-4 text-center mono-font text-xs text-white/60">
              {standing.wins}
            </td>

            <td className="px-3 py-4 text-center mono-font text-xs text-white/60">
              {standing.draws}
            </td>

            <td className="px-3 py-4 text-center mono-font text-xs text-white/60">
              {standing.losses}
            </td>

            <td className="px-3 py-4 text-center mono-font text-sm font-black text-[#f4b93f]">
              {standing.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}