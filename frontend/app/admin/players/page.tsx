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
  X,
} from "lucide-react";

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

type PlayerForm = {
  name: string;
  teamId: string;
};

const emptyForm: PlayerForm = {
  name: "",
  teamId: "",
};

export default function AdminPlayersPage() {
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:6967";

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<PlayerForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPlayerTeamId = (player: Player) => {
    return player.teamId ?? player.team?.id ?? null;
  };

  const getPlayerTeamName = (player: Player) => {
    return (
      player.teamName ??
      player.team?.name ??
      teams.find((team) => team.id === getPlayerTeamId(player))?.name ??
      "Unassigned"
    );
  };

  const getTeamSportName = (team: Team) => {
    return (
      team.sportName ??
      team.sport?.name ??
      "Unassigned"
    );
  };

  const filteredPlayers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return players;
    }

    return players.filter((player) => {
      const teamName = getPlayerTeamName(player).toLowerCase();

      return (
        player.name.toLowerCase().includes(value) ||
        teamName.includes(value) ||
        String(player.id).includes(value)
      );
    });
  }, [search, players, teams]);

  const totalTeamsWithPlayers = useMemo(() => {
    return new Set(
      players
        .map((player) => getPlayerTeamId(player))
        .filter((id): id is number => id !== null)
    ).size;
  }, [players]);

  const selectedTeam = useMemo(() => {
    return teams.find((team) => String(team.id) === form.teamId);
  }, [teams, form.teamId]);

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

      const [playersResponse, teamsResponse] = await Promise.all([
        fetch(`${API_URL}/api/players`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/teams`, {
          cache: "no-store",
        }),
      ]);

      if (!playersResponse.ok) {
        const message = await playersResponse.text();

        throw new Error(
          `Failed to load players (${playersResponse.status}): ${
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

      const playersData = await playersResponse.json();
      const teamsData = await teamsResponse.json();

      setPlayers(playersData);
      setTeams(teamsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load players"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPlayer(null);

    setForm({
      name: "",
      teamId: teams[0]?.id ? String(teams[0].id) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (player: Player) => {
    const teamId = getPlayerTeamId(player);

    setEditingPlayer(player);

    setForm({
      name: player.name,
      teamId: teamId ? String(teamId) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPlayer(null);
    setForm(emptyForm);
    setError("");
  };

  const savePlayer = async () => {
    if (!form.name.trim()) {
      setError("Player name is required.");
      return;
    }

    if (!form.teamId) {
      setError("Please select a team.");
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
        name: form.name.trim(),
        teamId: Number(form.teamId),
      };

      const url = editingPlayer
        ? `${API_URL}/api/players/${editingPlayer.id}`
        : `${API_URL}/api/players`;

      const method = editingPlayer ? "PUT" : "POST";

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
            `Failed to ${editingPlayer ? "update" : "create"} player`
        );
      }

      const savedPlayer = await response.json();

      if (editingPlayer) {
        setPlayers((current) =>
          current.map((player) =>
            player.id === editingPlayer.id ? savedPlayer : player
          )
        );

        setSuccess("Player updated successfully.");
      } else {
        setPlayers((current) => [...current, savedPlayer]);

        setSuccess("Player added successfully.");
      }

      setShowModal(false);
      setEditingPlayer(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save player"
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePlayer = async (player: Player) => {
    const confirmed = window.confirm(
      `Delete "${player.name}"? This cannot be undone.`
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
        `${API_URL}/api/players/${player.id}`,
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
          message || "Failed to delete player"
        );
      }

      setPlayers((current) =>
        current.filter((item) => item.id !== player.id)
      );

      setSuccess(`${player.name} deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete player"
      );
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
                Players
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3pxpx_0_#063b32]"
          >
            <Plus size={21} />
            Add Player
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-7 text-[#fff7e8] shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-70">
              Total Players
            </p>

            <p className="mt-3 text-6xl font-black">
              {players.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Total Teams
            </p>

            <p className="mt-3 text-6xl font-black">
              {teams.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Teams With Players
            </p>

            <p className="mt-3 text-6xl font-black">
              {totalTeamsWithPlayers}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-55">
              Competition Setup
            </p>

            <h2 className="mt-1 text-3xl font-black uppercase">
              Manage Players
            </h2>
          </div>

          <div className="relative w-full md:w-[380px]">
            <Search
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH PLAYERS..."
              className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-4 pl-12 pr-4 text-base font-bold uppercase tracking-wide outline-none shadow-[5px_5px_0_#063b32] placeholder:opacity-40 focus:shadow-[7px_7px_0_#063b32]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-7 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-5 text-base font-bold text-[#fff7e8] shadow-[5px_5px_0_#063b32]">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-7 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#d7c85f] px-6 py-5 text-base font-black shadow-[5px_5px_0_#063b32]">
            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <section className="mt-8 overflow-hidden border-2 border-[#063b32] bg-[#fbf5e8] shadow-[7px_7px_0_#063b32]">
          <div className="hidden grid-cols-[90px_2fr_2fr_150px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Player</div>
            <div>Team</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <p className="text-base font-bold uppercase tracking-[0.15em] opacity-50">
                Loading players...
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                <Users size={34} />
              </div>

              <h3 className="mt-6 text-2xl font-black uppercase">
                No Players Found
              </h3>

              <p className="mt-2 text-base font-semibold opacity-60">
                Add your first Freshers&apos; Cup player.
              </p>
            </div>
          ) : (
            <div>
              {filteredPlayers.map((player, index) => {
                const team = teams.find(
                  (item) => item.id === getPlayerTeamId(player)
                );

                return (
                  <div
                    key={player.id}
                    className={`grid items-center border-b-2 border-[#063b32] px-6 py-6 last:border-b-0 lg:grid-cols-[90px_2fr_2fr_150px] ${
                      index % 2 === 0
                        ? "bg-[#fbf5e8]"
                        : "bg-[#f0e5cf]"
                    }`}
                  >
                    <div className="text-lg font-black opacity-50">
                      #{player.id}
                    </div>

                    <div className="mt-3 lg:mt-0">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                          <Users size={29} />
                        </div>

                        <div>
                          <p className="text-xl font-black uppercase">
                            {player.name}
                          </p>

                          <p className="mt-1 text-sm font-semibold opacity-50">
                            Player #{player.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 lg:mt-0">
                      <p className="text-sm font-bold uppercase opacity-45 lg:hidden">
                        Team
                      </p>

                      <div className="mt-1">
                        <p className="text-base font-black uppercase">
                          {getPlayerTeamName(player)}
                        </p>

                        <p className="mt-1 text-sm font-semibold opacity-50">
                          {team
                            ? getTeamSportName(team)
                            : "Sport unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3 lg:mt-0">
                      <button
                        onClick={() => openEditModal(player)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#fff7e8]"
                        title="Edit"
                      >
                        <Edit3 size={19} />
                      </button>

                      <button
                        onClick={() => deletePlayer(player)}
                        className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#e85a4f] text-[#fff7e8]"
                        title="Delete"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
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
                  {editingPlayer ? "Edit Player" : "Add Player"}
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
                  Player Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-black uppercase tracking-[0.14em]">
                  Team
                </label>

                <select
                  value={form.teamId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      teamId: e.target.value,
                    }))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold uppercase outline-none"
                >
                  <option value="">SELECT TEAM</option>

                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} — {getTeamSportName(team)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Team
                  </p>

                  <p className="mt-2 text-2xl font-black uppercase">
                    {selectedTeam.name}
                  </p>

                  <p className="mt-1 text-sm font-bold uppercase opacity-70">
                    {getTeamSportName(selectedTeam)}
                  </p>
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
                  onClick={savePlayer}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPlayer
                    ? "Save Changes"
                    : "Create Player"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}