"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Sports", href: "/sports" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Schedule", href: "/matches" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-white/15 bg-[#063b32]">
      <div className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:h-[88px] lg:px-10">

        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center border border-[#ff625b] text-[#ff625b]">
            <span className="text-2xl leading-none">
              ✣
            </span>
          </div>

          <div className="flex flex-col leading-none">
            <span className="display-font text-[28px] tracking-tight text-[#f4f0e5]">
              SPARK
            </span>
          </div>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex xl:gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mono-font whitespace-nowrap text-[17px] font-bold tracking-[0.02em] text-[#f4f0e5]/85 transition-colors duration-200 hover:text-[#ff625b]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href="/admin"
            className="hidden border-2 border-black bg-[#ff625b] px-6 py-4 mono-font text-[11px] font-bold uppercase tracking-[0.08em] text-black shadow-[4px_4px_0_#041f1b] transition-transform hover:-translate-y-0.5 md:block"
          >
            Admin Login →
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-12 w-12 items-center justify-center border border-white/15 bg-[#084239] text-[#f4f0e5] lg:hidden"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#042e28] lg:hidden">
          <nav className="mx-auto flex max-w-[1600px] flex-col px-5 py-3 sm:px-8">

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="mono-font border-b border-white/10 py-5 text-sm font-bold uppercase tracking-[0.08em] text-[#f4f0e5]/90"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="my-5 border-2 border-black bg-[#ff625b] px-5 py-4 text-center mono-font text-xs font-bold uppercase tracking-[0.08em] text-black shadow-[4px_4px_0_#041f1b]"
            >
              Admin Login →
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}