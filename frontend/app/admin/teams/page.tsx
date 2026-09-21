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
  X,
  Users,
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

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:6967";

  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<TeamForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getTeamSportId = (team: Team) => {
    return team.sportId ?? team.sport?.id ?? null;
  };

  const getTeamSportName = (team: Team) => {
    return (
      team.sportName ??
      team.sport?.name ??
      sports.find((sport) => sport.id === getTeamSportId(team))?.name ??
      "Unassigned"
    );
  };

  const filteredTeams = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return teams;
    }

    return teams.filter((team) => {
      const sportName = getTeamSportName(team).toLowerCase();

      return (
        team.name.toLowerCase().includes(value) ||
        sportName.includes(value) ||
        String(team.id).includes(value)
      );
    });
  }, [search, teams, sports]);

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

      const [teamsResponse, sportsResponse] = await Promise.all([
        fetch(`${API_URL}/api/teams`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/sports`, {
          cache: "no-store",
        }),
      ]);

      if (!teamsResponse.ok) {
        const message = await teamsResponse.text();

        throw new Error(
          `Failed to load teams (${teamsResponse.status}): ${
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

      const teamsData = await teamsResponse.json();
      const sportsData = await sportsResponse.json();

      setTeams(teamsData);
      setSports(
        [...sportsData].sort(
          (a: Sport, b: Sport) => a.displayOrder - b.displayOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTeam(null);

    setForm({
      name: "",
      sportId: sports[0]?.id ? String(sports[0].id) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (team: Team) => {
    const sportId = getTeamSportId(team);

    setEditingTeam(team);

    setForm({
      name: team.name,
      sportId: sportId ? String(sportId) : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTeam(null);
    setForm(emptyForm);
    setError("");
  };

  const saveTeam = async () => {
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

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const payload = {
        name: form.name.trim(),
        sportId: Number(form.sportId),
      };

      const url = editingTeam
        ? `${API_URL}/api/teams/${editingTeam.id}`
        : `${API_URL}/api/teams`;

      const method = editingTeam ? "PUT" : "POST";

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
          message || `Failed to ${editingTeam ? "update" : "create"} team`
        );
      }

      const savedTeam = await response.json();

      if (editingTeam) {
        setTeams((current) =>
          current.map((team) =>
            team.id === editingTeam.id ? savedTeam : team
          )
        );

        setSuccess("Team updated successfully.");
      } else {
        setTeams((current) => [...current, savedTeam]);

        setSuccess("Team added successfully.");
      }

      setShowModal(false);
      setEditingTeam(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save team"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTeam = async (team: Team) => {
    const confirmed = window.confirm(
      `Delete "${team.name}"? This cannot be undone.`
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

      const response = await fetch(`${API_URL}/api/teams/${team.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to delete team"
        );
      }

      setTeams((current) =>
        current.filter((item) => item.id !== team.id)
      );

      setSuccess(`${team.name} deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete team"
      );
    }
  };

  const activeSports = sports.filter((sport) => sport.active);

  const sportsRepresented = new Set(
    teams
      .map((team) => getTeamSportId(team))
      .filter((id): id is number => id !== null)
  ).size;

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
                Teams
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-6 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32]"
          >
            <Plus size={21} />
            Add Team
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-7 text-[#fff7e8] shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-70">
              Total Teams
            </p>

            <p className="mt-3 text-6xl font-black">
              {teams.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Active Sports
            </p>

            <p className="mt-3 text-6xl font-black">
              {activeSports.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-7 shadow-[7px_7px_0_#063b32]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-60">
              Sports With Teams
            </p>

            <p className="mt-3 text-6xl font-black">
              {sportsRepresented}
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-55">
              Competition Setup
            </p>

            <h2 className="mt-1 text-3xl font-black uppercase">
              Manage Teams
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
              placeholder="SEARCH TEAMS..."
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
          <div className="hidden grid-cols-[80px_2fr_1.5fr_150px] border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div>ID</div>
            <div>Team</div>
            <div>Sport</div>
            <div>Actions</div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <p className="text-base font-bold uppercase tracking-[0.15em] opacity-50">
                Loading teams...
              </p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                <Users size={34} />
              </div>

              <h3 className="mt-6 text-2xl font-black uppercase">
                No Teams Found
              </h3>

              <p className="mt-2 text-base font-semibold opacity-60">
                Add your first Freshers&apos; Cup team.
              </p>
            </div>
          ) : (
            <div>
              {filteredTeams.map((team, index) => (
                <div
                  key={team.id}
                  className={`grid items-center border-b-2 border-[#063b32] px-6 py-6 last:border-b-0 lg:grid-cols-[80px_2fr_1.5fr_150px] ${
                    index % 2 === 0
                      ? "bg-[#fbf5e8]"
                      : "bg-[#f0e5cf]"
                  }`}
                >
                  <div className="text-lg font-black opacity-50">
                    #{team.id}
                  </div>

                  <div className="mt-3 lg:mt-0">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                        <Users size={28} />
                      </div>

                      <div>
                        <p className="text-xl font-black uppercase">
                          {team.name}
                        </p>

                        <p className="mt-1 text-sm font-semibold opacity-50">
                          Team #{team.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 lg:mt-0">
                    <p className="text-sm font-bold uppercase opacity-45 lg:hidden">
                      Sport
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-base font-black text-[#fff7e8]">
                        {getTeamSportName(team).slice(0, 1)}
                      </div>

                      <p className="text-base font-black uppercase">
                        {getTeamSportName(team)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3 lg:mt-0">
                    <button
                      onClick={() => openEditModal(team)}
                      className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#fff7e8]"
                      title="Edit"
                    >
                      <Edit3 size={19} />
                    </button>

                    <button
                      onClick={() => deleteTeam(team)}
                      className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#e85a4f] text-[#fff7e8]"
                      title="Delete"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                </div>
              ))}
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
                  {editingTeam ? "Edit Team" : "Add Team"}
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
                  Team Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Thunder"
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />
              </div>

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
                    }))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold uppercase outline-none"
                >
                  <option value="">SELECT SPORT</option>

                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {form.sportId && (
                <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                    Selected Sport
                  </p>

                  <p className="mt-2 text-2xl font-black uppercase">
                    {
                      sports.find(
                        (sport) => String(sport.id) === form.sportId
                      )?.name
                    }
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
                  onClick={saveTeam}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
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