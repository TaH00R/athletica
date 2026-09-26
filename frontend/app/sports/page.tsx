import Link from "next/link";
import SportCard from "@/components/sports/SportCard";
import { api } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

export default async function SportsPage() {
  const sports = await api.sports.getActive();

  const orderedSports = [...sports].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] pt-20 text-[#f4f0e5]">
        <Navbar />

      <section>
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="mono-font text-sm font-bold uppercase tracking-[0.14em] text-white/70 sm:text-base">
              {orderedSports.length} SPORTS
            </h2>

            <span className="mono-font text-xs uppercase tracking-[0.12em] text-white/40 sm:text-sm">
              Choose your game →
            </span>
          </div>

          {orderedSports.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {orderedSports.map((sport) => (
                <SportCard
                  key={sport.id}
                  sport={sport}
                />
              ))}
            </div>
          ) : (
            <div className="border border-white/15 bg-[#0a443a] px-6 py-16 text-center">
              <p className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/45">
                No sports available right now.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}