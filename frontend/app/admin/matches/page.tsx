"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit3,
  MapPin,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";

type Sport = {
  id: number;
  name: string;
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

type MatchStatus =
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

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
  status: MatchStatus;
  winnerId: number | null;
  winnerName: string | null;
};

type MatchForm = {
  sportId: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  venue: string;
  roundName: string;
  scheduledAt: string;
  status: MatchStatus;
};

const emptyForm: MatchForm = {
  sportId: "",
  teamAId: "",
  teamBId: "",
  scoreA: 0,
  scoreB: 0,
  venue: "",
  roundName: "",
  scheduledAt: "",
  status: "UPCOMING",
};

const statusOptions: MatchStatus[] = [
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminMatchesPage() {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:6967";

  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | MatchStatus>(
    "ALL"
  );
  const [sportFilter, setSportFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [form, setForm] = useState<MatchForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [scoreValues, setScoreValues] = useState<
    Record<number, { scoreA: number; scoreB: number }>
  >({});

  const getTeamSportId = (team: Team) => {
    return team.sportId ?? team.sport?.id ?? null;
  };

  const filteredTeamsForForm = useMemo(() => {
    if (!form.sportId) {
      return teams;
    }

    return teams.filter(
      (team) =>
        String(getTeamSportId(team)) === String(form.sportId)
    );
  }, [teams, form.sportId]);

  const filteredMatches = useMemo(() => {
    const value = search.toLowerCase().trim();

    return matches.filter((match) => {
      const matchesSearch =
        !value ||
        match.teamAName.toLowerCase().includes(value) ||
        match.teamBName.toLowerCase().includes(value) ||
        match.sportName.toLowerCase().includes(value) ||
        match.venue?.toLowerCase().includes(value) ||
        match.roundName?.toLowerCase().includes(value) ||
        String(match.id).includes(value);

      const matchesStatus =
        statusFilter === "ALL" || match.status === statusFilter;

      const matchesSport =
        sportFilter === "ALL" ||
        String(match.sportId) === sportFilter;

      return matchesSearch && matchesStatus && matchesSport;
    });
  }, [matches, search, statusFilter, sportFilter]);

  const liveCount = matches.filter(
    (match) => match.status === "LIVE"
  ).length;

  const upcomingCount = matches.filter(
    (match) => match.status === "UPCOMING"
  ).length;

  const completedCount = matches.filter(
    (match) => match.status === "COMPLETED"
  ).length;

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

      const [matchesResponse, sportsResponse, teamsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/matches`, {
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/sports`, {
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/teams`, {
            cache: "no-store",
          }),
        ]);

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

      if (!teamsResponse.ok) {
        const message = await teamsResponse.text();

        throw new Error(
          `Failed to load teams (${teamsResponse.status}): ${
            message || "No response body"
          }`
        );
      }

      const [matchesData, sportsData, teamsData] =
        await Promise.all([
          matchesResponse.json(),
          sportsResponse.json(),
          teamsResponse.json(),
        ]);

      const sortedMatches = [...matchesData].sort(
        (a: Match, b: Match) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      );

      setMatches(sortedMatches);

      setSports(
        [...sportsData].sort(
          (a: Sport, b: Sport) =>
            a.displayOrder - b.displayOrder
        )
      );

      setTeams(teamsData);

      const initialScores: Record<
        number,
        { scoreA: number; scoreB: number }
      > = {};

      matchesData.forEach((match: Match) => {
        initialScores[match.id] = {
          scoreA: match.scoreA ?? 0,
          scoreB: match.scoreB ?? 0,
        };
      });

      setScoreValues(initialScores);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load matches"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMatch(null);

    setForm({
      ...emptyForm,
      sportId: sports[0]?.id ? String(sports[0].id) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (match: Match) => {
    const localDate = new Date(match.scheduledAt);

    const formattedDate = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEditingMatch(match);

    setForm({
      sportId: String(match.sportId),
      teamAId: String(match.teamAId),
      teamBId: String(match.teamBId),
      scoreA: match.scoreA ?? 0,
      scoreB: match.scoreB ?? 0,
      venue: match.venue ?? "",
      roundName: match.roundName ?? "",
      scheduledAt: formattedDate,
      status: match.status,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMatch(null);
    setForm(emptyForm);
    setError("");
  };

  const saveMatch = async () => {
    if (!form.sportId) {
      setError("Please select a sport.");
      return;
    }

    if (!form.teamAId || !form.teamBId) {
      setError("Please select both teams.");
      return;
    }

    if (form.teamAId === form.teamBId) {
      setError("A team cannot play against itself.");
      return;
    }

    if (!form.scheduledAt) {
      setError("Please select a date and time.");
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
        sportId: Number(form.sportId),
        teamAId: Number(form.teamAId),
        teamBId: Number(form.teamBId),
        scoreA: Number(form.scoreA),
        scoreB: Number(form.scoreB),
        venue: form.venue.trim() || null,
        roundName: form.roundName.trim() || null,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        status: form.status,
      };

      const url = editingMatch
        ? `${API_URL}/api/matches/${editingMatch.id}`
        : `${API_URL}/api/matches`;

      const method = editingMatch ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to ${
              editingMatch ? "update" : "create"
            } match`
        );
      }

      const savedMatch = await response.json();

      if (editingMatch) {
        setMatches((current) =>
          current
            .map((match) =>
              match.id === editingMatch.id
                ? savedMatch
                : match
            )
            .sort(
              (a, b) =>
                new Date(a.scheduledAt).getTime() -
                new Date(b.scheduledAt).getTime()
            )
        );

        setSuccess("Match updated successfully.");
      } else {
        setMatches((current) =>
          [...current, savedMatch].sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          )
        );

        setSuccess("Match created successfully.");
      }

      setShowModal(false);
      setEditingMatch(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save match"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMatch = async (match: Match) => {
    const confirmed = window.confirm(
      `Delete Match #${match.id}? This cannot be undone.`
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
        `${API_URL}/api/matches/${match.id}`,
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
          message || "Failed to delete match"
        );
      }

      setMatches((current) =>
        current.filter((item) => item.id !== match.id)
      );

      setSuccess(`Match #${match.id} deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete match"
      );
    }
  };

  const updateScore = async (match: Match) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const values = scoreValues[match.id] ?? {
        scoreA: match.scoreA ?? 0,
        scoreB: match.scoreB ?? 0,
      };

      const response = await fetch(
        `${API_URL}/api/matches/${match.id}/score`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scoreA: Number(values.scoreA),
            scoreB: Number(values.scoreB),
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to update score"
        );
      }

      const updatedMatch = await response.json();

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id ? updatedMatch : item
        )
      );

      setSuccess(`Match #${match.id} score updated.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update score"
      );
    }
  };

  const updateStatus = async (
    match: Match,
    status: MatchStatus
  ) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/matches/${match.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to update match status"
        );
      }

      const updatedMatch = await response.json();

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id ? updatedMatch : item
        )
      );

      setSuccess(`Match #${match.id} is now ${status}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update match status"
      );
    }
  };

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const statusClasses = (status: MatchStatus) => {
    switch (status) {
      case "LIVE":
        return "bg-[#e85a4f] text-[#fff7e8]";
      case "COMPLETED":
        return "bg-[#d7c85f]";
      case "CANCELLED":
        return "bg-[#d9cebb]";
      default:
        return "bg-[#fbf5e8]";
    }
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
                Matches
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32]"
          >
            <Plus size={21} />
            Add Match
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-4">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-7 text-[#fff7e8] shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-70">
              Total Matches
            </p>

            <p className="mt-3 text-6xl font-black">
              {matches.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#e85a4f] p-7 text-[#fff7e8] shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-80">
              Live
            </p>

            <p className="mt-3 text-6xl font-black">
              {liveCount}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Upcoming
            </p>

            <p className="mt-3 text-6xl font-black">
              {upcomingCount}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Completed
            </p>

            <p className="mt-3 text-6xl font-black">
              {completedCount}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-55">
              Competition Control
            </p>

            <h2 className="mt-1 text-3xl font-black uppercase">
              Manage Matches
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
            <div className="relative md:w-[360px]">
              <Search
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH MATCHES..."
                className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-4 pl-12 pr-4 text-base font-bold uppercase tracking-wide outline-none shadow-[5px_5px_0_#063b32]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | MatchStatus
                )
              }
              className="border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none shadow-[5px_5px_0_#063b32]"
            >
              <option value="ALL">ALL STATUS</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

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

        <section className="mt-8">
          {loading ? (
            <div className="border-2 border-[#063b32] bg-[#fbf5e8] px-6 py-20 text-center shadow-[7px_7px_0_#063b32]">
              <p className="text-base font-bold uppercase tracking-[0.15em] opacity-50">
                Loading matches...
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="border-2 border-[#063b32] bg-[#fbf5e8] px-6 py-20 text-center shadow-[7px_7px_0_#063b32]">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                <CalendarDays size={34} />
              </div>

              <h3 className="mt-6 text-2xl font-black uppercase">
                No Matches Found
              </h3>

              <p className="mt-2 text-base font-semibold opacity-60">
                Create a match to get the competition moving.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMatches.map((match) => (
                <article
                  key={match.id}
                  className="border-2 border-[#063b32] bg-[#fbf5e8] shadow-[7px_7px_0_#063b32]"
                >
                  <div className="flex flex-col gap-4 border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-[#fff7e8] lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="border-2 border-[#fff7e8] px-3 py-2 text-xs font-black uppercase">
                        Match #{match.id}
                      </span>

                      <span className="text-sm font-black uppercase tracking-wide">
                        {match.sportName}
                      </span>

                      {match.roundName && (
                        <span className="text-sm font-semibold opacity-70">
                          {match.roundName}
                        </span>
                      )}
                    </div>

                    <span
                      className={`w-fit border-2 border-[#fff7e8] px-4 py-2 text-sm font-black uppercase ${
                        match.status === "LIVE"
                          ? "bg-[#e85a4f]"
                          : "bg-[#063b32]"
                      }`}
                    >
                      {match.status === "LIVE" && "● "}
                      {match.status}
                    </span>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:p-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] opacity-45">
                        Team A
                      </p>

                      <p className="mt-2 text-3xl font-black uppercase lg:text-4xl">
                        {match.teamAName}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-60">
                        <MapPin size={16} />
                        {match.venue || "Venue not set"}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-45">
                        Score
                      </p>

                      <div className="mt-2 flex items-center justify-center gap-4">
                        <p className="text-5xl font-black">
                          {match.scoreA}
                        </p>

                        <span className="text-3xl font-black opacity-35">
                          :
                        </span>

                        <p className="text-5xl font-black">
                          {match.scoreB}
                        </p>
                      </div>

                      <p className="mt-3 text-sm font-bold opacity-55">
                        {formatDate(match.scheduledAt)}
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-xs font-black uppercase tracking-[0.15em] opacity-45">
                        Team B
                      </p>

                      <p className="mt-2 text-3xl font-black uppercase lg:text-4xl">
                        {match.teamBName}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-60 lg:justify-end">
                        <CalendarDays size={16} />
                        {match.winnerName
                          ? `Winner: ${match.winnerName}`
                          : "Winner pending"}
                      </div>
                    </div>
                  </div>

                  {match.status === "LIVE" && (
                    <div className="border-t-2 border-[#063b32] bg-[#e9dfca] p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Zap size={20} />
                            <p className="text-xl font-black uppercase">
                              Live Score Control
                            </p>
                          </div>

                          <p className="mt-1 text-sm font-semibold opacity-55">
                            Update the score while the match is in progress.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={0}
                              value={
                                scoreValues[match.id]?.scoreA ??
                                match.scoreA
                              }
                              onChange={(e) =>
                                setScoreValues((current) => ({
                                  ...current,
                                  [match.id]: {
                                    scoreA: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                    scoreB:
                                      current[match.id]?.scoreB ??
                                      match.scoreB,
                                  },
                                }))
                              }
                              className="h-14 w-20 border-2 border-[#063b32] bg-[#fbf5e8] text-center text-2xl font-black outline-none"
                            />

                            <span className="text-2xl font-black">
                              :
                            </span>

                            <input
                              type="number"
                              min={0}
                              value={
                                scoreValues[match.id]?.scoreB ??
                                match.scoreB
                              }
                              onChange={(e) =>
                                setScoreValues((current) => ({
                                  ...current,
                                  [match.id]: {
                                    scoreA:
                                      current[match.id]?.scoreA ??
                                      match.scoreA,
                                    scoreB: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                  },
                                }))
                              }
                              className="h-14 w-20 border-2 border-[#063b32] bg-[#fbf5e8] text-center text-2xl font-black outline-none"
                            />
                          </div>

                          <button
                            onClick={() => updateScore(match)}
                            className="flex items-center justify-center gap-2 border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-sm font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32]"
                          >
                            <Check size={18} />
                            Update Score
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(match, "COMPLETED")
                            }
                            className="border-2 border-[#063b32] bg-[#d7c85f] px-5 py-4 text-sm font-black uppercase shadow-[4px_4px_0_#063b32]"
                          >
                            End Match
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#063b32] px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {match.status !== "LIVE" &&
                        match.status !== "COMPLETED" && (
                          <button
                            onClick={() =>
                              updateStatus(match, "LIVE")
                            }
                            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-4 py-3 text-sm font-black uppercase text-[#fff7e8]"
                          >
                            <Zap size={17} />
                            Start Live
                          </button>
                        )}

                      {match.status === "UPCOMING" && (
                        <button
                          onClick={() =>
                            updateStatus(match, "CANCELLED")
                          }
                          className="border-2 border-[#063b32] bg-[#d9cebb] px-4 py-3 text-sm font-black uppercase"
                        >
                          Cancel
                        </button>
                      )}

                      {match.status === "COMPLETED" &&
                        match.winnerName && (
                          <div className="flex items-center gap-2 border-2 border-[#063b32] bg-[#d7c85f] px-4 py-3 text-sm font-black uppercase">
                            <Trophy size={17} />
                            {match.winnerName}
                          </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditModal(match)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#fff7e8]"
                        title="Edit"
                      >
                        <Edit3 size={19} />
                      </button>

                      <button
                        onClick={() => deleteMatch(match)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#e85a4f] text-[#fff7e8]"
                        title="Delete"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#063b32]/75 p-4">
          <div className="admin-modal-scroll max-h-[92vh] w-full max-w-3xl overflow-y-auto border-2 border-[#063b32] bg-[#f3ead8] shadow-[10px_10px_0_#063b32]">
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-[#063b32] bg-[#104c41] px-6 py-6 text-[#fff7e8]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-70">
                  Freshers&apos; Cup
                </p>

                <h2 className="mt-1 text-3xl font-black uppercase">
                  {editingMatch ? "Edit Match" : "Add Match"}
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
                  Sport
                </label>

                <select
                  value={form.sportId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      sportId: e.target.value,
                      teamAId: "",
                      teamBId: "",
                    }))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                >
                  <option value="">SELECT SPORT</option>

                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Team A
                  </label>

                  <select
                    value={form.teamAId}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        teamAId: e.target.value,
                      }))
                    }
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                  >
                    <option value="">SELECT TEAM A</option>

                    {filteredTeamsForForm.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Team B
                  </label>

                  <select
                    value={form.teamBId}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        teamBId: e.target.value,
                      }))
                    }
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                  >
                    <option value="">SELECT TEAM B</option>

                    {filteredTeamsForForm.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Venue
                  </label>

                  <input
                    value={form.venue}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        venue: e.target.value,
                      }))
                    }
                    placeholder="e.g. Main Ground"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Round
                  </label>

                  <input
                    value={form.roundName}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        roundName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Semi Final"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        scheduledAt: e.target.value,
                      }))
                    }
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-black uppercase tracking-[0.14em]">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        status: e.target.value as MatchStatus,
                      }))
                    }
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em]">
                  Score
                </p>

                <div className="mt-2 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold uppercase opacity-55">
                      Team A Score
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.scoreA}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          scoreA: Math.max(
                            0,
                            Number(e.target.value)
                          ),
                        }))
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-2xl font-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold uppercase opacity-55">
                      Team B Score
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.scoreB}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          scoreB: Math.max(
                            0,
                            Number(e.target.value)
                          ),
                        }))
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-2xl font-black outline-none"
                    />
                  </div>
                </div>
              </div>

              {form.teamAId && form.teamBId && (
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-center text-[#fff7e8]">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                      Team A
                    </p>

                    <p className="mt-2 text-xl font-black uppercase">
                      {
                        filteredTeamsForForm.find(
                          (team) =>
                            String(team.id) === form.teamAId
                        )?.name
                      }
                    </p>
                  </div>

                  <p className="text-center text-3xl font-black opacity-40">
                    VS
                  </p>

                  <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-center text-[#fff7e8]">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                      Team B
                    </p>

                    <p className="mt-2 text-xl font-black uppercase">
                      {
                        filteredTeamsForForm.find(
                          (team) =>
                            String(team.id) === form.teamBId
                        )?.name
                      }
                    </p>
                  </div>
                </div>
              )}

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
                  onClick={saveMatch}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingMatch
                    ? "Save Changes"
                    : "Create Match"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}