import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import { api } from "@/lib/api";

export default async function PlayersPage() {
  const players = await api.players.getAll();

  const groupedPlayers = players.reduce<
    Record<string, typeof players>
  >((groups, player) => {
    const teamName = player.teamName || "Unassigned";

    if (!groups[teamName]) {
      groups[teamName] = [];
    }

    groups[teamName].push(player);

    return groups;
  }, {});

  const teamGroups = Object.entries(groupedPlayers);

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
                THE PLAYERS
              </h1>

              <p className="mono-font mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                The people stepping onto the field, court, and table
                to represent their teams.
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

      <section>
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="mono-font text-sm font-bold uppercase tracking-[0.14em] text-white/70 sm:text-base">
              {players.length}{" "}
              {players.length === 1 ? "PLAYER" : "PLAYERS"}
            </h2>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              THE ROSTER
            </span>
          </div>

          {teamGroups.length > 0 ? (
            <div className="space-y-12 sm:space-y-14 lg:space-y-16">
              {teamGroups.map(([teamName, teamPlayers]) => (
                <div key={teamName}>
                  <div className="mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="mono-font mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff625b] sm:text-xs">
                          {teamPlayers.length}{" "}
                          {teamPlayers.length === 1
                            ? "PLAYER"
                            : "PLAYERS"}
                        </p>

                        <h2 className="display-font break-words text-4xl leading-none uppercase sm:text-5xl">
                          {teamName}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teamPlayers.map((player, index) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className="group relative min-w-0 overflow-hidden border border-white/20 bg-[#0a443a] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff625b] hover:bg-[#0d4b40] sm:p-6"
                      >
                        <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#ff625b]" />
                        <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#f4b93f]" />
                        <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#f4b93f]" />
                        <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#ff625b]" />

                        <div className="flex items-start justify-between gap-4">
                          <p className="mono-font text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                            PLAYER {String(index + 1).padStart(2, "0")}
                          </p>

                          <span className="shrink-0 text-xl font-bold text-[#ff625b] transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>

                        <h3 className="mt-8 break-words text-2xl font-black uppercase leading-tight tracking-tight text-[#f4f0e5] sm:text-3xl">
                          {player.name}
                        </h3>

                        <p className="mono-font mt-4 text-[10px] uppercase tracking-[0.1em] text-white/35">
                          {player.teamName}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-16 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/40">
                No players registered yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}