import Image from "next/image";
import Link from "next/link";
import type { Sport } from "@/types/sports";

type SportCardProps = {
  sport: Sport;
};

const sportImages: Record<string, string> = {
  Football: "/images/football.png",
  Cricket: "/images/cricket.png",
  Basketball: "/images/basketball.png",
  Volleyball: "/images/volleyball.png",
  Badminton: "/images/badminton.png",
  "Table Tennis": "/images/table-tennis.png",
  Athletic: "/images/athletic.png",
};

export default function SportCard({ sport }: SportCardProps) {
  const image = sportImages[sport.name];

  return (
    <Link
      href={`/sports/${sport.id}`}
      className="group relative flex w-full min-w-0 flex-col overflow-hidden border border-white/25 bg-[#0a443a] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff625b] hover:bg-[#0d4b40]"
    >
      <span className="absolute left-0 top-0 z-10 h-5 w-5 border-l-2 border-t-2 border-[#ff625b]" />
      <span className="absolute right-0 top-0 z-10 h-5 w-5 border-r-2 border-t-2 border-[#f4b93f]" />
      <span className="absolute bottom-0 left-0 z-10 h-5 w-5 border-b-2 border-l-2 border-[#f4b93f]" />
      <span className="absolute bottom-0 right-0 z-10 h-5 w-5 border-b-2 border-r-2 border-[#ff625b]" />

      <div className="relative flex h-[230px] w-full items-center justify-center overflow-hidden border-b border-white/10 sm:h-[250px]">
        {image ? (
          <>
            <div className="absolute h-36 w-36 rounded-full bg-[#ff625b]/8 blur-3xl transition-all duration-300 group-hover:bg-[#ff625b]/14" />

            <Image
              src={image}
              alt={sport.name}
              fill
              className="object-contain p-10 transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </>
        ) : (
          <span className="mono-font text-sm font-bold uppercase tracking-[0.12em] text-white/35">
            {sport.name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-5">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black uppercase tracking-tight text-[#f4f0e5] sm:text-2xl">
            {sport.name}
          </h3>
        </div>

        <span className="shrink-0 text-xl font-bold text-[#ff625b] transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
          →
        </span>
      </div>
    </Link>
  );
}