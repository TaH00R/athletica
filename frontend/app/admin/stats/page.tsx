"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { api } from "@/lib/api";
import type {
  Match,
  Player,
  PlayerStat,
  PlayerStatRequest,
  Sport,
} from "@/types";

type StatForm = {
  playerId: string;
  matchId: string;
  statType: string;
  value: number;
};

const emptyForm: StatForm = {
  playerId: "",
  matchId: "",
  statType: "",
  value: 0,
};

export default function AdminStatsPage() {
  const router = useRouter();

  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] =
    useState("ALL");
  const [matchFilter, setMatchFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] =
    useState(false);
  const [editingStat, setEditingStat] =
    useState<PlayerStat | null>(null);
  const [form, setForm] =
    useState<StatForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedMatch = useMemo(() => {
    return matches.find(
      (match) =>
        String(match.id) === form.matchId
    );
  }, [matches, form.matchId]);

  const playersForSelectedMatch =
    useMemo(() => {
      if (!selectedMatch) {
        return players;
      }

      const teamIds = new Set([
        selectedMatch.teamAId,
        selectedMatch.teamBId,
      ]);

      return players.filter((player) => {
        const teamId = player.teamId;

        return (
          teamId !== undefined &&
          teamIds.has(teamId)
        );
      });
    }, [players, selectedMatch]);

  const getPlayerName = (
    stat: PlayerStat
  ) => {
    return (
      stat.playerName ||
      players.find(
        (player) =>
          player.id === stat.playerId
      )?.name ||
      "Unknown Player"
    );
  };

  const getPlayerTeamName = (
    stat: PlayerStat
  ) => {
    return (
      players.find(
        (player) =>
          player.id === stat.playerId
      )?.teamName ||
      "Unknown Team"
    );
  };

  const getMatch = (stat: PlayerStat) => {
    return matches.find(
      (match) => match.id === stat.matchId
    );
  };

  const getSport = (stat: PlayerStat) => {
    const match = getMatch(stat);

    return sports.find(
      (sport) => sport.id === match?.sportId
    );
  };

  const filteredStats = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return stats.filter((stat) => {
      const playerName =
        getPlayerName(stat).toLowerCase();

      const teamName =
        getPlayerTeamName(stat).toLowerCase();

      const match = getMatch(stat);

      const sport = getSport(stat);

      const sportName =
        sport?.name?.toLowerCase() || "";

      const matchName = match
        ? `${match.teamAName} ${match.teamBName}`
            .toLowerCase()
        : "";

      const matchesSearch =
        !value ||
        playerName.includes(value) ||
        teamName.includes(value) ||
        sportName.includes(value) ||
        matchName.includes(value) ||
        stat.statType
          .toLowerCase()
          .includes(value) ||
        String(stat.id).includes(value);

      const matchesSport =
        sportFilter === "ALL" ||
        String(match?.sportId) ===
          sportFilter;

      const matchesMatch =
        matchFilter === "ALL" ||
        String(match?.id) ===
          matchFilter;

      return (
        matchesSearch &&
        matchesSport &&
        matchesMatch
      );
    });
  }, [
    stats,
    players,
    matches,
    sports,
    search,
    sportFilter,
    matchFilter,
  ]);

  const uniquePlayers = useMemo(() => {
    return new Set(
      stats.map((stat) => stat.playerId)
    ).size;
  }, [stats]);

  const uniqueMatches = useMemo(() => {
    return new Set(
      stats.map((stat) => stat.matchId)
    ).size;
  }, [stats]);

  const totalValue = useMemo(() => {
    return stats.reduce(
      (total, stat) =>
        total + Number(stat.value || 0),
      0
    );
  }, [stats]);

  useEffect(() => {
    const token =
      localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin");
      return;
    }

    loadData();
  }, [router]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        statsData,
        playersData,
        matchesData,
        sportsData,
      ] = await Promise.all([
        api.stats.getAll(),
        api.players.getAll(),
        api.matches.getAll(),
        api.sports.getAll(),
      ]);

      setStats(statsData);
      setPlayers(playersData);

      setMatches(
        [...matchesData].sort(
          (a, b) =>
            new Date(
              b.scheduledAt
            ).getTime() -
            new Date(
              a.scheduledAt
            ).getTime()
        )
      );

      setSports(
        [...sportsData].sort(
          (a, b) =>
            a.displayOrder -
            b.displayOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingStat(null);

    setForm({
      ...emptyForm,
      matchId:
        matches[0]?.id
          ? String(matches[0].id)
          : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(
    stat: PlayerStat
  ) {
    setEditingStat(stat);

    setForm({
      playerId: String(stat.playerId),
      matchId: String(stat.matchId),
      statType: stat.statType,
      value: Number(stat.value),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingStat(null);
    setForm(emptyForm);
    setError("");
  }

  async function saveStat() {
    if (!form.matchId) {
      setError("Please select a match.");
      return;
    }

    if (!form.playerId) {
      setError("Please select a player.");
      return;
    }

    if (!form.statType.trim()) {
      setError("Stat type is required.");
      return;
    }

    if (Number(form.value) < 0) {
      setError(
        "Stat value cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: PlayerStatRequest = {
        playerId: Number(form.playerId),
        matchId: Number(form.matchId),
        statType: form.statType.trim(),
        value: Number(form.value),
      };

      const savedStat =
        await api.stats.create(payload);

      setStats((current) => {
        const existingIndex =
          current.findIndex(
            (stat) =>
              stat.id === savedStat.id ||
              (stat.playerId ===
                payload.playerId &&
                stat.matchId ===
                  payload.matchId &&
                stat.statType.toLowerCase() ===
                  payload.statType.toLowerCase())
          );

        if (existingIndex === -1) {
          return [...current, savedStat];
        }

        return current.map(
          (stat, index) =>
            index === existingIndex
              ? savedStat
              : stat
        );
      });

      setSuccess(
        editingStat
          ? "Player stat updated successfully."
          : "Player stat added successfully."
      );

      setShowModal(false);
      setEditingStat(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save stat"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStat(
    stat: PlayerStat
  ) {
    const confirmed =
      window.confirm(
        `Delete ${getPlayerName(stat)}'s ${stat.statType} stat?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.stats.delete(stat.id);

      setStats((current) =>
        current.filter(
          (item) => item.id !== stat.id
        )
      );

      setSuccess(
        "Player stat deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete stat"
      );
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3ead8] text-[#063b32]">
      <header className="sticky top-0 z-40 border-b-2 border-[#063b32] bg-[#f3ead8]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() =>
                router.push(
                  "/admin/dashboard"
                )
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#fbf5e8] shadow-[4px_4px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#063b32] sm:h-14 sm:w-14 sm:shadow-[5px_5px_0_#063b32]"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] opacity-60 min-[420px]:text-xs sm:text-sm sm:tracking-[0.2em]">
                <Trophy size={15} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 truncate text-3xl font-black uppercase tracking-tight min-[420px]:text-4xl lg:text-5xl">
                Player Stats
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32] sm:px-6 lg:w-auto"
          >
            <Plus size={20} />
            Add Stat
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32] min-[420px]:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70 sm:text-sm sm:tracking-[0.18em]">
              Total Stats
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {stats.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Players Tracked
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {uniquePlayers}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Matches Tracked
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {uniqueMatches}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#d7c85f] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65 sm:text-sm">
              Stat Value
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {totalValue}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-55 sm:text-sm sm:tracking-[0.2em]">
              Competition Data
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
              Manage Player Stats
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
            <div className="relative min-w-0 flex-1 xl:w-[320px]">
              <Search
                size={21}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="SEARCH STATS..."
                className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-4 pl-12 pr-4 text-base font-bold uppercase tracking-wide outline-none shadow-[5px_5px_0_#063b32] placeholder:opacity-40"
              />
            </div>

            <select
              value={sportFilter}
              onChange={(e) =>
                setSportFilter(e.target.value)
              }
              className="w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none shadow-[5px_5px_0_#063b32] md:w-auto"
            >
              <option value="ALL">
                ALL SPORTS
              </option>

              {sports.map((sport) => (
                <option
                  key={sport.id}
                  value={sport.id}
                >
                  {sport.name}
                </option>
              ))}
            </select>

            <select
              value={matchFilter}
              onChange={(e) =>
                setMatchFilter(e.target.value)
              }
              className="w-full max-w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none shadow-[5px_5px_0_#063b32] md:w-auto md:max-w-[280px]"
            >
              <option value="ALL">
                ALL MATCHES
              </option>

              {matches.map((match) => (
                <option
                  key={match.id}
                  value={match.id}
                >
                  #{match.id} —{" "}
                  {match.teamAName} vs{" "}
                  {match.teamBName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && !showModal && (
          <div className="mt-6 flex items-start justify-between gap-4 border-2 border-[#063b32] bg-[#e85a4f] px-4 py-4 text-sm font-bold text-[#fff7e8] shadow-[5px_5px_0_#063b32] sm:px-6 sm:py-5 sm:text-base">
            <span className="break-words">
              {error}
            </span>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-start justify-between gap-4 border-2 border-[#063b32] bg-[#d7c85f] px-4 py-4 text-sm font-black shadow-[5px_5px_0_#063b32] sm:px-6 sm:py-5 sm:text-base">
            <span className="break-words">
              {success}
            </span>

            <button
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <section className="mt-7 overflow-hidden border-2 border-[#063b32] bg-[#fbf5e8] shadow-[7px_7px_0_#063b32]">
          <div className="hidden grid-cols-[80px_1.5fr_1.3fr_1fr_120px_130px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Player</div>
            <div>Match</div>
            <div>Stat</div>
            <div>Value</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-50 sm:text-base">
                Loading player stats...
              </p>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-20 sm:w-20">
                <Trophy size={30} />
              </div>

              <h3 className="mt-5 text-xl font-black uppercase sm:text-2xl">
                No Stats Found
              </h3>

              <p className="mt-2 text-sm font-semibold opacity-60 sm:text-base">
                Add player statistics after a match.
              </p>
            </div>
          ) : (
            <div>
              {filteredStats.map(
                (stat, index) => {
                  const match =
                    getMatch(stat);

                  const sport =
                    getSport(stat);

                  return (
                    <div
                      key={stat.id}
                      className={`border-b-2 border-[#063b32] last:border-b-0 ${
                        index % 2 === 0
                          ? "bg-[#fbf5e8]"
                          : "bg-[#f0e5cf]"
                      }`}
                    >
                      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:grid lg:grid-cols-[80px_1.5fr_1.3fr_1fr_120px_130px] lg:items-center lg:gap-0">
                        <div className="flex items-center justify-between lg:block">
                          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Stat ID
                          </p>

                          <p className="text-base font-black opacity-55 lg:text-lg">
                            #{stat.id}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Player
                          </p>

                          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-16 sm:w-16">
                              <Users size={25} />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words text-xl font-black uppercase sm:text-2xl">
                                {getPlayerName(
                                  stat
                                )}
                              </p>

                              <p className="mt-1 break-words text-xs font-semibold opacity-50 sm:text-sm">
                                {getPlayerTeamName(
                                  stat
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Match
                          </p>

                          {match ? (
                            <div>
                              <p className="break-words text-base font-black uppercase sm:text-lg">
                                {match.teamAName}{" "}
                                vs{" "}
                                {match.teamBName}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold opacity-50 sm:text-sm">
                                <span>
                                  {sport?.name ||
                                    match.sportName}
                                </span>

                                <span className="hidden sm:inline">
                                  ·
                                </span>

                                <span>
                                  Match #{match.id}
                                </span>
                              </div>

                              <p className="mt-2 flex items-center gap-2 text-xs font-semibold opacity-50 sm:text-sm lg:hidden">
                                <CalendarDays
                                  size={14}
                                />
                                {formatDate(
                                  match.scheduledAt
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-base font-bold opacity-50">
                              Match #
                              {stat.matchId}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Stat Type
                          </p>

                          <span className="inline-block max-w-full break-words border-2 border-[#063b32] bg-[#d9cebb] px-3 py-2 text-sm font-black uppercase">
                            {stat.statType}
                          </span>
                        </div>

                        <div className="flex items-center justify-between lg:block">
                          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Value
                          </p>

                          <p className="text-4xl font-black sm:text-5xl">
                            {stat.value}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Actions
                          </p>

                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                openEditModal(
                                  stat
                                )
                              }
                              className="flex h-12 flex-1 items-center justify-center gap-2 border-2 border-[#063b32] bg-[#fff7e8] px-4 text-sm font-black uppercase sm:flex-none sm:w-12 sm:px-0"
                            >
                              <Edit3 size={18} />

                              <span className="sm:hidden">
                                Edit
                              </span>
                            </button>

                            <button
                              onClick={() =>
                                deleteStat(
                                  stat
                                )
                              }
                              className="flex h-12 flex-1 items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-4 text-sm font-black uppercase text-[#fff7e8] sm:flex-none sm:w-12 sm:px-0"
                            >
                              <Trash2 size={18} />

                              <span className="sm:hidden">
                                Delete
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063b32]/75 p-3 sm:p-4">
          <div className="admin-modal-scroll max-h-[94vh] w-full max-w-2xl overflow-y-auto border-2 border-[#063b32] bg-[#f3ead8] shadow-[7px_7px_0_#063b32] sm:shadow-[10px_10px_0_#063b32]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-[#063b32] bg-[#104c41] px-4 py-5 text-[#fff7e8] sm:px-6 sm:py-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70 sm:text-sm sm:tracking-[0.2em]">
                  Freshers&apos; Cup
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
                  {editingStat
                    ? "Edit Stat"
                    : "Add Stat"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#fff7e8] sm:h-11 sm:w-11"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:gap-6 sm:p-6">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Match
                </label>

                <select
                  value={form.matchId}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        matchId:
                          e.target.value,
                        playerId: "",
                      })
                    )
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-sm font-black uppercase outline-none sm:text-base"
                >
                  <option value="">
                    SELECT MATCH
                  </option>

                  {matches
                    .filter(
                      (match) =>
                        match.status !==
                        "CANCELLED"
                    )
                    .map((match) => (
                      <option
                        key={match.id}
                        value={match.id}
                      >
                        #{match.id} —{" "}
                        {match.sportName} —{" "}
                        {match.teamAName} vs{" "}
                        {match.teamBName}
                      </option>
                    ))}
                </select>
              </div>

              {selectedMatch && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Match
                  </p>

                  <p className="mt-2 break-words text-xl font-black uppercase sm:text-2xl">
                    {
                      selectedMatch.teamAName
                    }{" "}
                    vs{" "}
                    {
                      selectedMatch.teamBName
                    }
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold uppercase opacity-70 sm:text-sm">
                    <span>
                      {
                        selectedMatch.sportName
                      }
                    </span>

                    {selectedMatch.roundName && (
                      <>
                        <span>·</span>
                        <span>
                          {
                            selectedMatch.roundName
                          }
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold opacity-65 sm:text-sm">
                    <CalendarDays
                      size={15}
                    />
                    {formatDate(
                      selectedMatch.scheduledAt
                    )}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Player
                </label>

                <select
                  value={form.playerId}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        playerId:
                          e.target.value,
                      })
                    )
                  }
                  disabled={!form.matchId}
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-sm font-black uppercase outline-none disabled:opacity-50 sm:text-base"
                >
                  <option value="">
                    {form.matchId
                      ? "SELECT PLAYER"
                      : "SELECT MATCH FIRST"}
                  </option>

                  {playersForSelectedMatch.map(
                    (player) => (
                      <option
                        key={player.id}
                        value={player.id}
                      >
                        {player.name} —{" "}
                        {player.teamName ||
                          "No Team"}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Stat Type
                </label>

                <input
                  value={form.statType}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        statType:
                          e.target.value,
                      })
                    )
                  }
                  placeholder={
                    selectedMatch
                      ? sports.find(
                          (sport) =>
                            sport.id ===
                            selectedMatch.sportId
                        )?.primaryStat ||
                        "Goals / Runs / Points"
                      : "Goals / Runs / Points"
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />

                {selectedMatch && (
                  <p className="mt-2 break-words text-xs font-semibold opacity-55 sm:text-sm">
                    Primary stat for this sport:{" "}
                    {sports.find(
                      (sport) =>
                        sport.id ===
                        selectedMatch.sportId
                    )?.primaryStat ||
                      "Not configured"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Value
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        value: Math.max(
                          0,
                          Number(
                            e.target.value
                          )
                        ),
                      })
                    )
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-3xl font-black outline-none sm:text-4xl"
                />
              </div>

              {error && (
                <div className="break-words border-2 border-[#063b32] bg-[#e85a4f] px-4 py-4 text-sm font-bold text-[#fff7e8] sm:px-5 sm:text-base">
                  {error}
                </div>
              )}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="border-2 border-[#063b32] bg-[#d9cebb] px-5 py-4 text-base font-black uppercase shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveStat}
                  disabled={saving}
                  className="border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingStat
                      ? "Save Changes"
                      : "Add Stat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}