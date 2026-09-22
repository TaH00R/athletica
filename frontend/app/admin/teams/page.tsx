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
import type {
  Sport,
  Team,
  TeamRequest,
} from "@/types";

type TeamForm = {
  name: string;
  sportId: string;
};

const emptyForm: TeamForm = {
  name: "",
  sportId: "",
};

export default function AdminTeamsPage() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] =
    useState(false);
  const [editingTeam, setEditingTeam] =
    useState<Team | null>(null);
  const [form, setForm] =
    useState<TeamForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getTeamSportId = (team: Team) => {
    return team.sportId ?? null;
  };

  const getTeamSportName = (team: Team) => {
    return (
      team.sportName ??
      sports.find(
        (sport) =>
          sport.id ===
          getTeamSportId(team)
      )?.name ??
      "Unassigned"
    );
  };

  const selectedSport = useMemo(() => {
    return sports.find(
      (sport) =>
        String(sport.id) === form.sportId
    );
  }, [sports, form.sportId]);

  const filteredTeams = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return teams;
    }

    return teams.filter((team) => {
      const sportName =
        getTeamSportName(team).toLowerCase();

      return (
        team.name
          .toLowerCase()
          .includes(value) ||
        sportName.includes(value) ||
        String(team.id).includes(value)
      );
    });
  }, [search, teams, sports]);

  const activeSports = sports.filter(
    (sport) => sport.active
  );

  const sportsRepresented = useMemo(() => {
    return new Set(
      teams.map((team) =>
        getTeamSportId(team)
      )
    ).size;
  }, [teams]);

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

      const [teamsData, sportsData] =
        await Promise.all([
          api.teams.getAll(),
          api.sports.getAll(),
        ]);

      setTeams(teamsData);

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
          : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingTeam(null);

    setForm({
      name: "",
      sportId: sports[0]?.id
        ? String(sports[0].id)
        : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(team: Team) {
    setEditingTeam(team);

    setForm({
      name: team.name,
      sportId: String(team.sportId),
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
    setEditingTeam(null);
    setForm(emptyForm);
    setError("");
  }

  async function saveTeam() {
    if (!form.name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!form.sportId) {
      setError("Please select a sport.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: TeamRequest = {
        name: form.name.trim(),
        sportId: Number(form.sportId),
      };

      const savedTeam = editingTeam
        ? await api.teams.update(
            editingTeam.id,
            payload
          )
        : await api.teams.create(payload);

      if (editingTeam) {
        setTeams((current) =>
          current.map((team) =>
            team.id === editingTeam.id
              ? savedTeam
              : team
          )
        );

        setSuccess(
          "Team updated successfully."
        );
      } else {
        setTeams((current) => [
          ...current,
          savedTeam,
        ]);

        setSuccess(
          "Team added successfully."
        );
      }

      setShowModal(false);
      setEditingTeam(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save team"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeam(team: Team) {
    const confirmed =
      window.confirm(
        `Delete "${team.name}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.teams.delete(team.id);

      setTeams((current) =>
        current.filter(
          (item) => item.id !== team.id
        )
      );

      setSuccess(
        `${team.name} deleted successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete team"
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
                router.push(
                  "/admin/dashboard"
                )
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#fbf5e8] shadow-[4px_4px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#063b32] sm:h-14 sm:w-14 sm:shadow-[5px_5px_0_#063b32]"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 min-[420px]:text-xs sm:text-sm sm:tracking-[0.2em]">
                <Trophy size={15} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 truncate text-3xl font-black uppercase tracking-tight min-[420px]:text-4xl lg:text-5xl">
                Teams
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32] sm:px-6 lg:w-auto"
          >
            <Plus size={20} />
            Add Team
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32] min-[420px]:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70 sm:text-sm sm:tracking-[0.18em]">
              Total Teams
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {teams.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Active Sports
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {activeSports.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Sports With Teams
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {sportsRepresented}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-55 sm:text-sm sm:tracking-[0.2em]">
              Competition Setup
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
              Manage Teams
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
              placeholder="SEARCH TEAMS..."
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
          <div className="hidden grid-cols-[80px_2fr_1.5fr_150px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Team</div>
            <div>Sport</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-50 sm:text-base">
                Loading teams...
              </p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-20 sm:w-20">
                <Users size={30} />
              </div>

              <h3 className="mt-5 text-xl font-black uppercase sm:text-2xl">
                No Teams Found
              </h3>

              <p className="mt-2 text-sm font-semibold opacity-60 sm:text-base">
                Add your first Freshers&apos; Cup team.
              </p>
            </div>
          ) : (
            <div>
              {filteredTeams.map(
                (team, index) => (
                  <div
                    key={team.id}
                    className={`border-b-2 border-[#063b32] last:border-b-0 ${
                      index % 2 === 0
                        ? "bg-[#fbf5e8]"
                        : "bg-[#f0e5cf]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:grid lg:grid-cols-[80px_2fr_1.5fr_150px] lg:items-center lg:gap-0">
                      <div className="flex items-center justify-between lg:block">
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Team ID
                        </p>

                        <p className="text-base font-black opacity-55 lg:text-lg">
                          #{team.id}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Team
                        </p>

                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-16 sm:w-16">
                            <Users size={25} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-xl font-black uppercase sm:text-2xl">
                              {team.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold opacity-50 sm:text-sm">
                              Team #{team.id}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Sport
                        </p>

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-base font-black text-[#fff7e8]">
                            {getTeamSportName(
                              team
                            )
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <p className="break-words text-base font-black uppercase sm:text-lg">
                            {getTeamSportName(
                              team
                            )}
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
                                team
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
                              deleteTeam(
                                team
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
                )
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
                  {editingTeam
                    ? "Edit Team"
                    : "Add Team"}
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
                  Team Name
                </label>

                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        name: e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Thunder"
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Sport
                </label>

                <select
                  value={form.sportId}
                  onChange={(e) =>
                    setForm(
                      (current) => ({
                        ...current,
                        sportId:
                          e.target.value,
                      })
                    )
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black uppercase outline-none"
                >
                  <option value="">
                    SELECT SPORT
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
              </div>

              {selectedSport && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Sport
                  </p>

                  <p className="mt-2 break-words text-xl font-black uppercase sm:text-2xl">
                    {selectedSport.name}
                  </p>

                  <p className="mt-1 text-xs font-bold uppercase opacity-70 sm:text-sm">
                    {selectedSport.primaryStat
                      ? `Primary stat: ${selectedSport.primaryStat}`
                      : "Primary stat not configured"}
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
                  onClick={saveTeam}
                  disabled={saving}
                  className="border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTeam
                      ? "Save Changes"
                      : "Create Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}