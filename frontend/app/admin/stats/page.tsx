"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
  CalendarDays,
  X,
} from "lucide-react";

type Sport = {
  id: number;
  name: string;
  primaryStat: string | null;
  active: boolean;
  displayOrder: number;
};

type Team = {
  id: number;
  name: string;
  sportId?: number;
  sportName?: string;
  sport?: {
    id: number;
    name: string;
  } | null;
};

type Player = {
  id: number;
  name: string;
  teamId?: number;
  teamName?: string;
  team?: {
    id: number;
    name: string;
    sport?: {
      id: number;
      name: string;
    } | null;
  } | null;
};

type Match = {
  id: number;
  sportId: number;
  sportName: string;
  teamAId: number;
  teamAName: string;
  scoreA: number;
  teamBId: number;
  teamBName: string;
  scoreB: number;
  venue: string | null;
  roundName: string | null;
  scheduledAt: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  winnerId: number | null;
  winnerName: string | null;
};

type PlayerStat = {
  id: number;
  playerId?: number;
  playerName?: string;
  matchId?: number;
  statType: string;
  value: number;
  player?: {
    id: number;
    name: string;
    team?: {
      id: number;
      name: string;
    } | null;
  } | null;
  match?: {
    id: number;
  } | null;
};

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

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:6967";

  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [matchFilter, setMatchFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState<PlayerStat | null>(null);
  const [form, setForm] = useState<StatForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPlayerId = (stat: PlayerStat) => {
    return stat.playerId ?? stat.player?.id ?? null;
  };

  const getPlayerName = (stat: PlayerStat) => {
    return (
      stat.playerName ??
      stat.player?.name ??
      players.find((player) => player.id === getPlayerId(stat))?.name ??
      "Unknown Player"
    );
  };

  const getMatchId = (stat: PlayerStat) => {
    return stat.matchId ?? stat.match?.id ?? null;
  };

  const getMatch = (stat: PlayerStat) => {
    return matches.find((match) => match.id === getMatchId(stat));
  };

  const getPlayerTeamName = (stat: PlayerStat) => {
    if (stat.player?.team?.name) {
      return stat.player.team.name;
    }

    const player = players.find(
      (item) => item.id === getPlayerId(stat)
    );

    if (player?.teamName) {
      return player.teamName;
    }

    if (player?.team?.name) {
      return player.team.name;
    }

    return "Unknown Team";
  };

  const getStatSportId = (stat: PlayerStat) => {
    const match = getMatch(stat);
    return match?.sportId ?? null;
  };

  const getStatSportName = (stat: PlayerStat) => {
    return getMatch(stat)?.sportName ?? "Unknown Sport";
  };

  const selectedMatch = useMemo(() => {
    return matches.find(
      (match) => String(match.id) === form.matchId
    );
  }, [matches, form.matchId]);

  const playersForSelectedMatch = useMemo(() => {
    if (!selectedMatch) {
      return players;
    }

    const teamIds = new Set([
      selectedMatch.teamAId,
      selectedMatch.teamBId,
    ]);

    return players.filter((player) => {
      const teamId = player.teamId ?? player.team?.id;

      return teamId ? teamIds.has(teamId) : false;
    });
  }, [players, selectedMatch]);

  const filteredStats = useMemo(() => {
    const value = search.toLowerCase().trim();

    return stats.filter((stat) => {
      const playerName = getPlayerName(stat).toLowerCase();
      const teamName = getPlayerTeamName(stat).toLowerCase();
      const sportName = getStatSportName(stat).toLowerCase();
      const match = getMatch(stat);

      const matchesSearch =
        !value ||
        playerName.includes(value) ||
        teamName.includes(value) ||
        sportName.includes(value) ||
        stat.statType.toLowerCase().includes(value) ||
        String(stat.id).includes(value);

      const matchesSport =
        sportFilter === "ALL" ||
        String(getStatSportId(stat)) === sportFilter;

      const matchesMatch =
        matchFilter === "ALL" ||
        String(match?.id) === matchFilter;

      return matchesSearch && matchesSport && matchesMatch;
    });
  }, [stats, players, matches, search, sportFilter, matchFilter]);

  const uniquePlayers = useMemo(() => {
    return new Set(
      stats
        .map((stat) => getPlayerId(stat))
        .filter((id): id is number => id !== null)
    ).size;
  }, [stats]);

  const uniqueMatches = useMemo(() => {
    return new Set(
      stats
        .map((stat) => getMatchId(stat))
        .filter((id): id is number => id !== null)
    ).size;
  }, [stats]);

  const totalValue = useMemo(() => {
    return stats.reduce(
      (total, stat) => total + Number(stat.value || 0),
      0
    );
  }, [stats]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        playersResponse,
        matchesResponse,
        sportsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/player-stats`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/players`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/matches`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/sports`, {
          cache: "no-store",
        }),
      ]);

      if (!statsResponse.ok) {
        const message = await statsResponse.text();

        throw new Error(
          `Failed to load stats (${statsResponse.status}): ${
            message || "No response body"
          }`
        );
      }

      if (!playersResponse.ok) {
        const message = await playersResponse.text();

        throw new Error(
          `Failed to load players (${playersResponse.status}): ${
            message || "No response body"
          }`
        );
      }

      if (!matchesResponse.ok) {
        const message = await matchesResponse.text();

        throw new Error(
          `Failed to load matches (${matchesResponse.status}): ${
            message || "No response body"
          }`
        );
      }

      if (!sportsResponse.ok) {
        const message = await sportsResponse.text();

        throw new Error(
          `Failed to load sports (${sportsResponse.status}): ${
            message || "No response body"
          }`
        );
      }

      const [
        statsData,
        playersData,
        matchesData,
        sportsData,
      ] = await Promise.all([
        statsResponse.json(),
        playersResponse.json(),
        matchesResponse.json(),
        sportsResponse.json(),
      ]);

      setStats(statsData);
      setPlayers(playersData);

      setMatches(
        [...matchesData].sort(
          (a: Match, b: Match) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        )
      );

      setSports(
        [...sportsData].sort(
          (a: Sport, b: Sport) =>
            a.displayOrder - b.displayOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStat(null);

    setForm({
      ...emptyForm,
      matchId: matches[0]?.id ? String(matches[0].id) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (stat: PlayerStat) => {
    setEditingStat(stat);

    setForm({
      playerId: getPlayerId(stat)
        ? String(getPlayerId(stat))
        : "",
      matchId: getMatchId(stat)
        ? String(getMatchId(stat))
        : "",
      statType: stat.statType,
      value: Number(stat.value),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingStat(null);
    setForm(emptyForm);
    setError("");
  };

  const saveStat = async () => {
    if (!form.playerId) {
      setError("Please select a player.");
      return;
    }

    if (!form.matchId) {
      setError("Please select a match.");
      return;
    }

    if (!form.statType.trim()) {
      setError("Stat type is required.");
      return;
    }

    if (Number(form.value) < 0) {
      setError("Stat value cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const payload = {
        playerId: Number(form.playerId),
        matchId: Number(form.matchId),
        statType: form.statType.trim(),
        value: Number(form.value),
      };

      const response = await fetch(`${API_URL}/api/player-stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to save player stat"
        );
      }

      const savedStat = await response.json();

      setStats((current) => {
        const existingIndex = current.findIndex(
          (stat) =>
            stat.id === savedStat.id ||
            (
              getPlayerId(stat) === Number(form.playerId) &&
              getMatchId(stat) === Number(form.matchId) &&
              stat.statType.toLowerCase() ===
                form.statType.trim().toLowerCase()
            )
        );

        if (existingIndex === -1) {
          return [...current, savedStat];
        }

        return current.map((stat, index) =>
          index === existingIndex ? savedStat : stat
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
        err instanceof Error ? err.message : "Failed to save stat"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteStat = async (stat: PlayerStat) => {
    const confirmed = window.confirm(
      `Delete ${getPlayerName(stat)}'s ${stat.statType} stat?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/player-stats/${stat.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to delete player stat"
        );
      }

      setStats((current) =>
        current.filter((item) => item.id !== stat.id)
      );

      setSuccess("Player stat deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete stat"
      );
    }
  };

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  };

  return (
    <main className="min-h-screen bg-[#f3ead8] text-[#063b32]">
      <header className="sticky top-0 z-40 border-b-2 border-[#063b32] bg-[#f3ead8]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex h-14 w-14 items-center justify-center border-2 border-[#063b32] bg-[#fbf5e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32]"
            >
              <ArrowLeft size={25} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] opacity-60">
                <Trophy size={17} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 text-4xl font-black uppercase tracking-tight lg:text-5xl">
                Player Stats
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32]"
          >
            <Plus size={21} />
            Add Stat
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-7 text-[#fff7e8] shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-70">
              Total Stats
            </p>

            <p className="mt-3 text-6xl font-black">
              {stats.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Players Tracked
            </p>

            <p className="mt-3 text-6xl font-black">
              {uniquePlayers}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Matches Tracked
            </p>

            <p className="mt-3 text-6xl font-black">
              {uniqueMatches}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#d7c85f] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-65">
              Stat Value
            </p>

            <p className="mt-3 text-6xl font-black">
              {totalValue}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-55">
              Competition Data
            </p>

            <h2 className="mt-1 text-3xl font-black uppercase">
              Manage Player Stats
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
            <div className="relative md:w-[320px]">
              <Search
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH STATS..."
                className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-4 pl-12 pr-4 text-base font-bold uppercase tracking-wide outline-none shadow-[5px_5px_0_#063b32]"
              />
            </div>

            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none shadow-[5px_5px_0_#063b32]"
            >
              <option value="ALL">ALL SPORTS</option>

              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>

            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none shadow-[5px_5px_0_#063b32]"
            >
              <option value="ALL">ALL MATCHES</option>

              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  #{match.id} — {match.teamAName} vs{" "}
                  {match.teamBName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-7 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-5 text-base font-bold text-[#fff7e8] shadow-[5px_5px_0_#063b32]">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-7 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#d7c85f] px-6 py-5 text-base font-black shadow-[5px_5px_0_#063b32]">
            <span>{success}</span>

            <button onClick={() => setSuccess("")}>
              <X size={20} />
            </button>
          </div>
        )}

        <section className="mt-8 overflow-hidden border-2 border-[#063b32] bg-[#fbf5e8] shadow-[7px_7px_0_#063b32]">
          <div className="hidden grid-cols-[80px_1.5fr_1.3fr_1fr_120px_130px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Player</div>
            <div>Match</div>
            <div>Stat</div>
            <div>Value</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <p className="text-base font-bold uppercase tracking-[0.15em] opacity-50">
                Loading player stats...
              </p>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                <Trophy size={34} />
              </div>

              <h3 className="mt-6 text-2xl font-black uppercase">
                No Stats Found
              </h3>

              <p className="mt-2 text-base font-semibold opacity-60">
                Add player statistics after a match.
              </p>
            </div>
          ) : (
            <div>
              {filteredStats.map((stat, index) => {
                const match = getMatch(stat);

                return (
                  <div
                    key={stat.id}
                    className={`grid items-center border-b-2 border-[#063b32] px-6 py-6 last:border-b-0 lg:grid-cols-[80px_1.5fr_1.3fr_1fr_120px_130px] ${
                      index % 2 === 0
                        ? "bg-[#fbf5e8]"
                        : "bg-[#f0e5cf]"
                    }`}
                  >
                    <div className="text-lg font-black opacity-50">
                      #{stat.id}
                    </div>

                    <div className="mt-4 lg:mt-0">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                          <Users size={29} />
                        </div>

                        <div>
                          <p className="text-xl font-black uppercase">
                            {getPlayerName(stat)}
                          </p>

                          <p className="mt-1 text-sm font-semibold opacity-50">
                            {getPlayerTeamName(stat)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 lg:mt-0">
                      <p className="text-sm font-bold uppercase opacity-45 lg:hidden">
                        Match
                      </p>

                      {match ? (
                        <div>
                          <p className="text-base font-black uppercase">
                            {match.teamAName} vs {match.teamBName}
                          </p>

                          <p className="mt-1 text-sm font-semibold opacity-50">
                            {match.sportName}
                          </p>
                        </div>
                      ) : (
                        <p className="text-base font-bold opacity-50">
                          Match #{getMatchId(stat)}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 lg:mt-0">
                      <p className="text-sm font-bold uppercase opacity-45 lg:hidden">
                        Stat Type
                      </p>

                      <span className="inline-block border-2 border-[#063b32] bg-[#d9cebb] px-3 py-2 text-sm font-black uppercase">
                        {stat.statType}
                      </span>
                    </div>

                    <div className="mt-5 lg:mt-0">
                      <p className="text-sm font-bold uppercase opacity-45 lg:hidden">
                        Value
                      </p>

                      <p className="text-4xl font-black">
                        {stat.value}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-3 lg:mt-0">
                      <button
                        onClick={() => openEditModal(stat)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#fff7e8]"
                        title="Edit"
                      >
                        <Edit3 size={19} />
                      </button>

                      <button
                        onClick={() => deleteStat(stat)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#e85a4f] text-[#fff7e8]"
                        title="Delete"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>

                    {match && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-50 lg:hidden">
                        <CalendarDays size={15} />
                        {formatDate(match.scheduledAt)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063b32]/75 p-4">
          <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto border-2 border-[#063b32] bg-[#f3ead8] shadow-[10px_10px_0_#063b32]">
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-[#063b32] bg-[#104c41] px-6 py-6 text-[#fff7e8]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-70">
                  Freshers&apos; Cup
                </p>

                <h2 className="mt-1 text-3xl font-black uppercase">
                  {editingStat ? "Edit Stat" : "Add Stat"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-11 w-11 items-center justify-center border-2 border-[#fff7e8]"
              >
                <X size={21} />
              </button>
            </div>

            <div className="grid gap-6 p-6">
              <div>
                <label className="text-sm font-black uppercase tracking-[0.14em]">
                  Match
                </label>

                <select
                  value={form.matchId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      matchId: e.target.value,
                      playerId: "",
                    }))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                >
                  <option value="">SELECT MATCH</option>

                  {matches
                    .filter(
                      (match) => match.status !== "CANCELLED"
                    )
                    .map((match) => (
                      <option key={match.id} value={match.id}>
                        #{match.id} — {match.sportName} —{" "}
                        {match.teamAName} vs {match.teamBName}
                      </option>
                    ))}
                </select>
              </div>

              {selectedMatch && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Match
                  </p>

                  <p className="mt-2 text-xl font-black uppercase">
                    {selectedMatch.teamAName} vs{" "}
                    {selectedMatch.teamBName}
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase opacity-70">
                    {selectedMatch.sportName}
                    {selectedMatch.roundName
                      ? ` · ${selectedMatch.roundName}`
                      : ""}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-black uppercase tracking-[0.14em]">
                  Player
                </label>

                <select
                  value={form.playerId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      playerId: e.target.value,
                    }))
                  }
                  disabled={!form.matchId}
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none disabled:opacity-50"
                >
                  <option value="">
                    {form.matchId
                      ? "SELECT PLAYER"
                      : "SELECT MATCH FIRST"}
                  </option>

                  {playersForSelectedMatch.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} —{" "}
                      {player.teamName ??
                        player.team?.name ??
                        "No Team"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.14em]">
                  Stat Type
                </label>

                <input
                  value={form.statType}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      statType: e.target.value,
                    }))
                  }
                  placeholder={
                    selectedMatch
                      ? sports.find(
                          (sport) =>
                            sport.id === selectedMatch.sportId
                        )?.primaryStat ||
                        "Goals / Runs / Points"
                      : "Goals / Runs / Points"
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />

                {selectedMatch && (
                  <p className="mt-2 text-sm font-semibold opacity-55">
                    Primary stat for this sport:{" "}
                    {sports.find(
                      (sport) =>
                        sport.id === selectedMatch.sportId
                    )?.primaryStat || "Not configured"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.14em]">
                  Value
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      value: Math.max(
                        0,
                        Number(e.target.value)
                      ),
                    }))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-3xl font-black outline-none"
                />
              </div>

              {error && (
                <div className="border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-base font-bold text-[#fff7e8]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#d9cebb] px-5 py-4 text-base font-black uppercase shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveStat}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
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