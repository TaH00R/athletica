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

import { api } from "@/lib/api";
import type { Player, Team } from "@/types";

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

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] =
    useState<Player | null>(null);
  const [form, setForm] = useState<PlayerForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPlayerTeamId = (player: Player) => {
    return player.teamId ?? null;
  };

  const getPlayerTeamName = (player: Player) => {
    return (
      player.teamName ??
      teams.find(
        (team) => team.id === getPlayerTeamId(player)
      )?.name ??
      "Unassigned"
    );
  };

  const getTeamSportName = (team: Team) => {
    return team.sportName ?? "Unassigned";
  };

  const filteredPlayers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return players;
    }

    return players.filter((player) => {
      const teamName =
        getPlayerTeamName(player).toLowerCase();

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
    return teams.find(
      (team) => String(team.id) === form.teamId
    );
  }, [teams, form.teamId]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

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

      const [playersData, teamsData] = await Promise.all([
        api.players.getAll(),
        api.teams.getAll(),
      ]);

      setPlayers(playersData);
      setTeams(teamsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load players"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingPlayer(null);

    setForm({
      name: "",
      teamId: teams[0]?.id
        ? String(teams[0].id)
        : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(player: Player) {
    const teamId = getPlayerTeamId(player);

    setEditingPlayer(player);

    setForm({
      name: player.name,
      teamId: teamId ? String(teamId) : "",
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
    setEditingPlayer(null);
    setForm(emptyForm);
    setError("");
  }

  async function savePlayer() {
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

      const savedPlayer = editingPlayer
        ? await api.players.update(
            editingPlayer.id,
            payload
          )
        : await api.players.create(payload);

      if (editingPlayer) {
        setPlayers((current) =>
          current.map((player) =>
            player.id === editingPlayer.id
              ? savedPlayer
              : player
          )
        );

        setSuccess("Player updated successfully.");
      } else {
        setPlayers((current) => [
          ...current,
          savedPlayer,
        ]);

        setSuccess("Player added successfully.");
      }

      setShowModal(false);
      setEditingPlayer(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save player"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePlayer(player: Player) {
    const confirmed = window.confirm(
      `Delete "${player.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      await api.players.delete(player.id);

      setPlayers((current) =>
        current.filter(
          (item) => item.id !== player.id
        )
      );

      setSuccess(
        `${player.name} deleted successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete player"
      );
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3ead8] text-[#063b32]">
      <header className="sticky top-0 z-40 border-b-2 border-[#063b32] bg-[#f3ead8]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() =>
                router.push("/admin/dashboard")
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#fbf5e8] shadow-[4px_4px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#063b32] sm:h-14 sm:w-14 sm:shadow-[5px_5px_0_#063b32]"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-60 min-[420px]:text-xs sm:text-sm sm:tracking-[0.2em]">
                <Trophy size={15} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 truncate text-3xl font-black uppercase tracking-tight min-[420px]:text-4xl lg:text-5xl">
                Players
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32] sm:px-6 lg:w-auto"
          >
            <Plus size={20} />
            Add Player
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32] min-[420px]:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70 sm:text-sm sm:tracking-[0.18em]">
              Total Players
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {players.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm sm:tracking-[0.18em]">
              Total Teams
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {teams.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm sm:tracking-[0.18em]">
              Teams With Players
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {totalTeamsWithPlayers}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-55 sm:text-sm sm:tracking-[0.2em]">
              Competition Setup
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
              Manage Players
            </h2>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search
              size={21}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="SEARCH PLAYERS..."
              className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-4 pl-12 pr-4 text-base font-bold uppercase tracking-wide outline-none shadow-[5px_5px_0_#063b32] placeholder:opacity-40 focus:shadow-[7px_7px_0_#063b32]"
            />
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
          <div className="hidden grid-cols-[90px_2fr_2fr_150px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Player</div>
            <div>Team</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-50 sm:text-base">
                Loading players...
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-20 sm:w-20">
                <Users size={30} />
              </div>

              <h3 className="mt-5 text-xl font-black uppercase sm:text-2xl">
                No Players Found
              </h3>

              <p className="mt-2 text-sm font-semibold opacity-60 sm:text-base">
                Add your first Freshers&apos; Cup player.
              </p>
            </div>
          ) : (
            <div>
              {filteredPlayers.map(
                (player, index) => {
                  const team = teams.find(
                    (item) =>
                      item.id ===
                      getPlayerTeamId(player)
                  );

                  return (
                    <div
                      key={player.id}
                      className={`border-b-2 border-[#063b32] last:border-b-0 ${
                        index % 2 === 0
                          ? "bg-[#fbf5e8]"
                          : "bg-[#f0e5cf]"
                      }`}
                    >
                      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:grid lg:grid-cols-[90px_2fr_2fr_150px] lg:items-center">
                        <div className="flex items-center justify-between lg:block">
                          <p className="text-sm font-black uppercase tracking-[0.12em] opacity-45 lg:text-lg lg:tracking-normal">
                            ID
                          </p>

                          <p className="text-base font-black opacity-55 lg:mt-1 lg:text-lg">
                            #{player.id}
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
                                {player.name}
                              </p>

                              <p className="mt-1 text-xs font-semibold opacity-50 sm:text-sm">
                                Player #{player.id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Team
                          </p>

                          <div className="min-w-0">
                            <p className="break-words text-base font-black uppercase sm:text-lg">
                              {getPlayerTeamName(
                                player
                              )}
                            </p>

                            <p className="mt-1 text-xs font-semibold uppercase opacity-50 sm:text-sm">
                              {team
                                ? getTeamSportName(
                                    team
                                  )
                                : "Sport unavailable"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                            Actions
                          </p>

                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                openEditModal(
                                  player
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
                                deletePlayer(
                                  player
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
                  {editingPlayer
                    ? "Edit Player"
                    : "Add Player"}
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
                  Player Name
                </label>

                <input
                  autoFocus
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
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
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
                  <option value="">
                    SELECT TEAM
                  </option>

                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name} —{" "}
                      {getTeamSportName(team)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Team
                  </p>

                  <p className="mt-2 break-words text-xl font-black uppercase sm:text-2xl">
                    {selectedTeam.name}
                  </p>

                  <p className="mt-1 text-xs font-bold uppercase opacity-70 sm:text-sm">
                    {getTeamSportName(
                      selectedTeam
                    )}
                  </p>
                </div>
              )}

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
                  onClick={savePlayer}
                  disabled={saving}
                  className="border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
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