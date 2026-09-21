import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import LiveMatchCard from "@/components/home/LiveMatchCard";
import SportsSection from "@/components/sports/SportsSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#063b32] text-[#f4f0e5]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/sports-hero.png"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[#063b32]/15" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#063b32]/85 via-[#063b32]/25 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#063b32]/70 via-transparent to-[#063b32]/10" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-[1600px] grid-cols-1 items-start gap-10 px-5 pb-14 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-10 lg:pt-25">
          <div className="max-w-3xl">
            <h1 className="display-font text-[4rem] leading-[0.82] tracking-tight sm:text-[5.3rem] md:text-[6.4rem] lg:text-[6.8rem] xl:text-[7.5rem]">
              NEW BATCH,
              <br />
              <span className="text-[#ff625b]">
                NEW RIVALRIES
              </span>
            </h1>

            <p className="mono-font mt-7 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              New Trials, New Triumphs, New Memories.
              <br />
              A stronger IIITG.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sports"
                className="border-2 border-black bg-[#ff625b] px-7 py-4 text-center mono-font text-xs font-bold uppercase text-black shadow-[5px_5px_0_#041f1b] transition-transform hover:-translate-y-0.5"
              >
                Explore Sports →
              </Link>

              <Link
                href="/matches"
                className="border border-white/40 bg-[#063b32]/30 px-7 py-4 text-center mono-font text-xs font-bold uppercase backdrop-blur-sm transition-colors hover:border-[#ff625b] hover:text-[#ff625b]"
              >
                Live Matches
                <span className="ml-2 text-[#ff625b]">
                  ●
                </span>
              </Link>
            </div>
          </div>

          <div className="flex w-full items-start justify-center lg:justify-end lg:-translate-y-12">
            <LiveMatchCard />
          </div>
        </div>
      </section>

      <SportsSection />
    </main>
  );
}