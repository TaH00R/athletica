import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import { api } from "@/lib/api";

export default async function AboutPage() {
  const [sports, teams, players] = await Promise.all([
    api.sports.getActive(),
    api.teams.getAll(),
    api.players.getAll(),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] pt-20 text-[#f4f0e5]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-br from-[#0d4b40] via-[#063b32] to-[#063b32]" />

        <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full border border-[#ff625b]/20 sm:h-96 sm:w-96" />
        <div className="absolute right-[-40px] top-[-60px] h-56 w-56 rounded-full border border-[#f4b93f]/10 sm:h-72 sm:w-72" />

        <div className="relative mx-auto max-w-[1600px] px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mono-font mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#ff625b] sm:text-sm">
                IIITG FRESHERS&apos; CUP · 2026
              </p>

              <h1 className="display-font text-[4.5rem] leading-[0.78] tracking-tight sm:text-[6.5rem] md:text-[8rem] lg:text-[9rem]">
                MORE THAN
                <br />
                <span className="text-[#ff625b]">A GAME.</span>
              </h1>

              <p className="mono-font mt-8 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                The Freshers&apos; Cup is where a new batch meets on the
                same field, the same court, and the same scoreboard.
                Competition is only part of it.
              </p>
            </div>

            <div className="border border-white/15 bg-[#0a443a] p-5 sm:p-6">
              <div className="border-b border-white/10 pb-5">
                <p className="mono-font text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                  THE MISSION
                </p>

                <p className="mt-4 text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
                  Play hard.
                  <br />
                  Meet people.
                  <br />
                  Make memories.
                </p>
              </div>

              <div className="pt-5">
                <p className="mono-font text-xs leading-6 text-white/45">
                  A stronger IIITG starts with a stronger community.
                  Sometimes that starts with a ball.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-3">
            <div className="bg-[#0a443a] p-5 sm:p-8">
              <p className="mono-font text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff625b]">
                SPORTS
              </p>

              <p className="display-font mt-3 text-5xl sm:text-6xl">
                {sports.length}
              </p>

              <p className="mono-font mt-2 text-[10px] uppercase tracking-[0.1em] text-white/35">
                Different Ways To Compete
              </p>
            </div>

            <div className="bg-[#0a443a] p-5 sm:p-8">
              <p className="mono-font text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff625b]">
                TEAMS
              </p>

              <p className="display-font mt-3 text-5xl sm:text-6xl">
                {teams.length}
              </p>

              <p className="mono-font mt-2 text-[10px] uppercase tracking-[0.1em] text-white/35">
                One Cup. Many Rivalries.
              </p>
            </div>

            <div className="col-span-2 bg-[#0a443a] p-5 sm:p-8 md:col-span-1">
              <p className="mono-font text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff625b]">
                PLAYERS
              </p>

              <p className="display-font mt-3 text-5xl sm:text-6xl">
                {players.length}
              </p>

              <p className="mono-font mt-2 text-[10px] uppercase tracking-[0.1em] text-white/35">
                Every Player Counts
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="mono-font mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b]">
                THE IDEA
              </p>

              <h2 className="display-font text-5xl leading-[0.88] sm:text-6xl lg:text-7xl">
                NEW BATCH.
                <br />
                NEW ENERGY.
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-xl font-bold uppercase leading-tight text-[#f4f0e5] sm:text-2xl">
                Freshers&apos; Cup is about getting people out of their
                rooms and into the action.
              </p>

              <p className="mono-font max-w-3xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
                Different teams. Different sports. Different rivalries.
                One campus. Whether you&apos;re playing, cheering,
                keeping score, or just showing up for the chaos, the
                goal is the same: make the first year memorable.
              </p>

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <div className="border-l-2 border-[#ff625b] bg-[#0a443a] px-5 py-4">
                  <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                    COMPETE
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase text-white/40">
                    Give it everything.
                  </p>
                </div>

                <div className="border-l-2 border-[#f4b93f] bg-[#0a443a] px-5 py-4">
                  <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                    CONNECT
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase text-white/40">
                    Meet your people.
                  </p>
                </div>

                <div className="border-l-2 border-[#f4b93f] bg-[#0a443a] px-5 py-4">
                  <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                    REPRESENT
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase text-white/40">
                    Back your team.
                  </p>
                </div>

                <div className="border-l-2 border-[#ff625b] bg-[#0a443a] px-5 py-4">
                  <p className="mono-font text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                    REMEMBER
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase text-white/40">
                    Make it count.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono-font mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ff625b]">
                THE CUP
              </p>

              <h2 className="display-font text-5xl leading-none sm:text-6xl">
                PLAY THE MOMENT.
              </h2>
            </div>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/30">
              IIITG · FRESHERS&apos; CUP
            </span>
          </div>

          <div className="relative overflow-hidden border border-white/15 bg-[#0a443a] p-6 sm:p-10">
            <div className="absolute right-[-40px] top-[-40px] text-[10rem] font-black leading-none text-white/[0.025] sm:text-[16rem]">
              26
            </div>

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="display-font max-w-4xl text-4xl leading-[0.9] sm:text-5xl md:text-6xl">
                  SHOW UP.
                  <br />
                  <span className="text-[#ff625b]">
                    MAKE SOME NOISE.
                  </span>
                </p>

                <p className="mono-font mt-6 max-w-2xl text-sm leading-7 text-white/45">
                  The scoreboard remembers the result.
                  You&apos;ll remember everything else.
                </p>
              </div>

              <Link
                href="/sports"
                className="border-2 border-black bg-[#ff625b] px-6 py-4 text-center mono-font text-xs font-bold uppercase text-black shadow-[5px_5px_0_#041f1b] transition-transform hover:-translate-y-0.5"
              >
                Explore The Cup →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="mono-font text-xs uppercase tracking-[0.12em] text-white/25">
            FRESHERS&apos; CUP · IIIT GUWAHATI
          </p>

          <Link
            href="/"
            className="mono-font w-fit text-sm font-bold uppercase tracking-wide text-white/55 transition-colors hover:text-[#ff625b]"
          >
            ← Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}