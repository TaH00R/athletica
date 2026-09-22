"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6967";

export default function AdminLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid username or password");
        }

        throw new Error("Unable to sign in");
      }

      const data = await response.json();

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_username", data.username);
      localStorage.setItem("admin_role", data.role);

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#063b32] text-[#f4f0e5]">
      <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center border border-[#ff625b] text-[#ff625b] sm:h-12 sm:w-12">
              <span className="text-2xl">
                ✣
              </span>
            </div>

            <div>
              <div className="display-font text-2xl sm:text-3xl">
                SPARK
              </div>

              <div className="mono-font mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                Freshers' Cup 2026
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="mono-font text-sm font-bold uppercase tracking-wide text-white/60 transition-colors hover:text-[#ff625b]"
          >
            ← Back Home
          </Link>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[1600px] items-center justify-center">
          <div className="w-full max-w-[480px]">

            <div className="mb-7">
              <div className="mono-font mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#ff625b]">
                Restricted Area
              </div>

              <h1 className="display-font text-5xl leading-none sm:text-6xl">
                ADMIN LOGIN
              </h1>

              <p className="mt-4 text-base leading-7 text-white/65">
                Manage matches, scores, players and
                tournament data.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative border border-white/25 bg-[#0a443a] p-6 shadow-[7px_7px_0_#041f1b] sm:p-8"
            >
              <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#ff625b]" />

              <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#f4b93f]" />

              <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#f4b93f]" />

              <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#ff625b]" />

              <div className="space-y-6">

                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/80"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    autoComplete="username"
                    required
                    className="w-full border border-white/25 bg-[#063b32] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff625b]"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/80"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                    className="w-full border border-white/25 bg-[#063b32] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ff625b]"
                    placeholder="Enter password"
                  />
                </div>

                {error && (
                  <div className="border border-[#ff625b]/50 bg-[#ff625b]/10 px-4 py-3 text-sm font-semibold text-[#ff8b86]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border-2 border-black bg-[#ff625b] px-5 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[5px_5px_0_#041f1b] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Enter Dashboard →"}
                </button>
              </div>
            </form>

            <p className="mono-font mt-5 text-center text-xs uppercase tracking-[0.12em] text-white/35">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}