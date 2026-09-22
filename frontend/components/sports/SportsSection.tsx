import Link from "next/link";
import SportCard from "./SportCard";
import { api } from "@/lib/api";

export default async function SportsSection() {
  const sports = await api.sports.getActive();

  const activeSports = sports.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <section className="border-b border-white/10 bg-[#063b32]">
      <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="display-font text-5xl leading-none tracking-tight sm:text-6xl">
              Our Sports
            </h2>
          </div>

          <Link
            href="/sports"
            className="text-sm font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-[#ff625b]"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {activeSports.map((sport) => (
            <SportCard
              key={sport.id}
              sport={sport}
            />
          ))}
        </div>
      </div>
    </section>
  );
}