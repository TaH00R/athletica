"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  LogOut,
  Menu,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";

import type {
  Match,
  Player,
  Sport,
  Team,
} from "@/types";

type AdminDashboardProps = {
  sports: Sport[];
  teams: Team[];
  players: Player[];
  liveMatches: Match[];
  upcomingMatches: Match[];
};

export default function AdminDashboard({
  sports,
  teams,
  players,
  liveMatches,
  upcomingMatches,
}: AdminDashboardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_role");

    window.location.href = "/admin";
  }

  const activeSports = sports.filter((sport) => sport.active);

  const statCards = [
    {
      label: "Sports",
      value: activeSports.length,
      icon: Trophy,
      href: "/admin/sports",
    },
    {
      label: "Teams",
      value: teams.length,
      icon: Shield,
      href: "/admin/teams",
    },
    {
      label: "Players",
      value: players.length,
      icon: Users,
      href: "/admin/players",
    },
    {
      label: "Live Matches",
      value: liveMatches.length,
      icon: Activity,
      href: "/admin/matches",
    },
  ];

  return (
    <main className="min-h-screen bg-[#063b32] text-[#f4f0e5]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] border-r border-white/10 bg-[#042e28] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-7 py-6">
            <Link href="/admin/dashboard">
              <div className="display-font text-2xl">
                ATHLETICA
              </div>

              <div className="mono-font mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                Admin Control
              </div>
            </Link>
          </div>

          <div className="flex-1 px-4 py-6">
            <div className="mono-font mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Management
            </div>

            <nav className="space-y-1">
              <SidebarLink
                href="/admin/dashboard"
                icon={<BarChart3 size={18} />}
                label="Overview"
                active
              />

              <SidebarLink
                href="/admin/sports"
                icon={<Trophy size={18} />}
                label="Sports"
              />

              <SidebarLink
                href="/admin/teams"
                icon={<Shield size={18} />}
                label="Teams"
              />

              <SidebarLink
                href="/admin/players"
                icon={<Users size={18} />}
                label="Players"
              />

              <SidebarLink
                href="/admin/matches"
                icon={<CalendarDays size={18} />}
                label="Matches"
              />

              <SidebarLink
                href="/admin/stats"
                icon={<Activity size={18} />}
                label="Player Stats"
              />
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 border border-white/10 px-4 py-3 text-left text-sm font-semibold text-white/65 transition-colors hover:border-[#ff625b] hover:text-[#ff625b]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#042e28] lg:hidden">
            <div className="flex min-h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div>
                  <div className="display-font text-2xl">
                    ATHLETICA
                  </div>

                  <div className="mono-font mt-1 text-[9px] uppercase tracking-[0.18em] text-white/40">
                    Admin Control
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center border border-white/15"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <MobileLink
                  href="/admin/dashboard"
                  label="Overview"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileLink
                  href="/admin/sports"
                  label="Sports"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileLink
                  href="/admin/teams"
                  label="Teams"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileLink
                  href="/admin/players"
                  label="Players"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileLink
                  href="/admin/matches"
                  label="Matches"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileLink
                  href="/admin/stats"
                  label="Player Stats"
                  onClick={() => setMenuOpen(false)}
                />
              </nav>

              <div className="border-t border-white/10 p-5">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-2 border-2 border-[#ff625b] px-4 py-4 text-sm font-bold uppercase text-[#ff625b]"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 lg:ml-[260px]">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#063b32]/95 backdrop-blur-md">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center border border-white/10 lg:hidden"
                >
                  <Menu size={19} />
                </button>

                <div>
                  <div className="text-sm font-bold uppercase tracking-wide">
                    Admin Dashboard
                  </div>

                  <div className="mono-font mt-1 text-[9px] uppercase tracking-[0.18em] text-white/40">
                    Freshers&apos; Cup 2026
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="h-2.5 w-2.5 rounded-full bg-[#79e0ad]" />

                <span className="mono-font text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                  System Online
                </span>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="mb-8">
              <div className="mono-font mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff625b]">
                Control Center
              </div>

              <h1 className="display-font text-5xl leading-none sm:text-6xl">
                GOOD TO SEE YOU.
              </h1>

              <p className="mt-3 max-w-2xl text-base text-white/55">
                Manage the Freshers&apos; Cup, update live matches and keep the
                tournament running.
              </p>
            </div>

            <div className="grid gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className="group relative overflow-hidden border border-white/15 bg-[#0a443a] p-5 transition-all hover:-translate-y-1 hover:border-[#ff625b]"
                  >
                    <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#ff625b]" />

                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center border border-white/15 text-[#ff625b]">
                        <Icon size={19} />
                      </div>

                      <ArrowRight
                        size={19}
                        className="text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-[#ff625b]"
                      />
                    </div>

                    <div className="mt-7">
                      <div className="display-font text-5xl">
                        {stat.value}
                      </div>

                      <div className="mt-1 text-sm font-bold uppercase tracking-wide text-white/55">
                        {stat.label}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <section className="border border-white/15 bg-[#0a443a]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        {liveMatches.length > 0 ? (
                          <>
                            <span className="absolute inset-0 animate-ping rounded-full bg-[#ff625b] opacity-60" />
                            <span className="relative block h-3 w-3 rounded-full bg-[#ff625b]" />
                          </>
                        ) : (
                          <span className="block h-3 w-3 rounded-full bg-white/25" />
                        )}
                      </span>

                      <h2 className="text-lg font-black uppercase">
                        Live Matches
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-white/40">
                      Control matches that are currently in progress.
                    </p>
                  </div>

                  <Link
                    href="/admin/matches"
                    className="mono-font hidden text-[10px] font-bold uppercase tracking-wide text-white/50 hover:text-[#ff625b] sm:block"
                  >
                    Manage →
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  {liveMatches.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center border border-white/10">
                        <Activity
                          size={24}
                          className="text-white/25"
                        />
                      </div>

                      <h3 className="mt-5 text-lg font-bold uppercase">
                        No Live Matches
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
                        No matches are currently in progress.
                      </p>

                      <Link
                        href="/admin/matches"
                        className="mt-6 border border-[#ff625b] px-5 py-3 text-sm font-bold uppercase text-[#ff625b]"
                      >
                        Manage Matches →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liveMatches.map((match) => (
                        <div
                          key={match.id}
                          className="border border-white/15 bg-[#063b32] p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm font-bold uppercase text-[#ff625b]">
                              {match.sportName}
                            </span>

                            {match.venue && (
                              <span className="max-w-[45%] break-words text-right text-xs font-semibold text-white/45 sm:text-sm">
                                {match.venue}
                              </span>
                            )}
                          </div>

                          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <span className="min-w-0 break-words text-base font-black sm:text-lg">
                                  {match.teamAName}
                                </span>

                                <span className="display-font shrink-0 text-3xl">
                                  {match.scoreA}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <span className="min-w-0 break-words text-base font-black sm:text-lg">
                                  {match.teamBName}
                                </span>

                                <span className="display-font shrink-0 text-3xl">
                                  {match.scoreB}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/admin/matches/${match.id}`}
                              className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#ff625b] text-[#ff625b] transition-colors hover:bg-[#ff625b] hover:text-[#041f1b]"
                              aria-label={`Manage match ${match.id}`}
                            >
                              <ChevronRight size={20} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="border border-white/15 bg-[#0a443a]">
                <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                  <h2 className="text-lg font-black uppercase">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Jump straight into management.
                  </p>
                </div>

                <div className="grid gap-2 p-4">
                  <QuickAction
                    href="/admin/sports"
                    label="Add Sport"
                    icon={<Trophy size={18} />}
                  />

                  <QuickAction
                    href="/admin/teams"
                    label="Add Team"
                    icon={<Shield size={18} />}
                  />

                  <QuickAction
                    href="/admin/players"
                    label="Add Player"
                    icon={<Users size={18} />}
                  />

                  <QuickAction
                    href="/admin/matches"
                    label="Create Match"
                    icon={<CalendarDays size={18} />}
                  />

                  <QuickAction
                    href="/admin/stats"
                    label="Add Player Stats"
                    icon={<BarChart3 size={18} />}
                  />
                </div>
              </section>
            </div>

            <section className="mt-6 border border-white/15 bg-[#0a443a]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-black uppercase">
                    Upcoming Matches
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Next scheduled fixtures.
                  </p>
                </div>

                <Link
                  href="/admin/matches"
                  className="mono-font text-[10px] font-bold uppercase tracking-wide text-white/50 hover:text-[#ff625b]"
                >
                  Manage →
                </Link>
              </div>

              <div className="divide-y divide-white/10">
                {upcomingMatches.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-white/35">
                    No upcoming matches.
                  </div>
                ) : (
                  upcomingMatches.slice(0, 5).map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col gap-4 px-5 py-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:px-6"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold uppercase text-[#ff625b]">
                          {match.sportName}
                        </div>

                        <div className="mt-1 break-words text-base font-bold">
                          {match.teamAName}

                          <span className="mx-2 text-white/25">
                            VS
                          </span>

                          {match.teamBName}
                        </div>

                        {match.venue && (
                          <div className="mt-1 break-words text-sm text-white/40">
                            {match.venue}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/admin/matches/${match.id}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-white/55 hover:border-[#ff625b] hover:text-[#ff625b]"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-[#ff625b] text-[#041f1b]"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block border-b border-white/10 py-5 text-lg font-bold uppercase"
    >
      {label}
    </Link>
  );
}

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border border-white/10 px-4 py-4 transition-colors hover:border-[#ff625b] hover:bg-white/[0.02]"
    >
      <div className="flex items-center gap-3">
        <span className="text-[#ff625b]">
          {icon}
        </span>

        <span className="text-sm font-bold uppercase">
          {label}
        </span>
      </div>

      <CirclePlus
        size={18}
        className="text-white/30 transition-colors group-hover:text-[#ff625b]"
      />
    </Link>
  );
}