"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
  Check,
  GripVertical,
} from "lucide-react";

type Sport = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  displayOrder: number;
  primaryStat: string | null;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
};

type SportForm = {
  name: string;
  description: string;
  icon: string;
  active: boolean;
  displayOrder: number;
  primaryStat: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
};

const emptyForm: SportForm = {
  name: "",
  description: "",
  icon: "",
  active: true,
  displayOrder: 0,
  primaryStat: "",
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
};

export default function AdminSportsPage() {
  const router = useRouter();

  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [form, setForm] = useState<SportForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin");
      return;
    }

    loadSports();
  }, [router]);

  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredSports(sports);
      return;
    }

    setFilteredSports(
      sports.filter(
        (sport) =>
          sport.name.toLowerCase().includes(value) ||
          sport.primaryStat?.toLowerCase().includes(value)
      )
    );
  }, [search, sports]);

  const loadSports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/sports`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load sports");
      }

      const data = await response.json();
      setSports(data);
      setFilteredSports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sports");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSport(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (sport: Sport) => {
    setEditingSport(sport);

    setForm({
      name: sport.name,
      description: sport.description ?? "",
      icon: sport.icon ?? "",
      active: sport.active,
      displayOrder: sport.displayOrder,
      primaryStat: sport.primaryStat ?? "",
      winPoints: sport.winPoints,
      drawPoints: sport.drawPoints,
      lossPoints: sport.lossPoints,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSport(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = <K extends keyof SportForm>(
    field: K,
    value: SportForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveSport = async () => {
    if (!form.name.trim()) {
      setError("Sport name is required.");
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
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        active: form.active,
        displayOrder: Number(form.displayOrder),
        primaryStat: form.primaryStat.trim() || null,
        winPoints: Number(form.winPoints),
        drawPoints: Number(form.drawPoints),
        lossPoints: Number(form.lossPoints),
      };

      const url = editingSport
        ? `${API_URL}/api/sports/${editingSport.id}`
        : `${API_URL}/api/sports`;

      const method = editingSport ? "PUT" : "POST";

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
        throw new Error(message || "Failed to save sport");
      }

      const savedSport = await response.json();

      if (editingSport) {
        setSports((current) =>
          current
            .map((sport) =>
              sport.id === editingSport.id ? savedSport : sport
            )
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );

        setSuccess("Sport updated successfully.");
      } else {
        setSports((current) =>
          [...current, savedSport].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )
        );

        setSuccess("Sport added successfully.");
      }

      setShowModal(false);
      setEditingSport(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sport");
    } finally {
      setSaving(false);
    }
  };

  const deleteSport = async (sport: Sport) => {
    const confirmed = window.confirm(
      `Delete "${sport.name}"? This cannot be undone.`
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

      const response = await fetch(`${API_URL}/api/sports/${sport.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete sport");
      }

      setSports((current) =>
        current.filter((item) => item.id !== sport.id)
      );

      setSuccess(`${sport.name} deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete sport"
      );
    }
  };

  const toggleSport = async (sport: Sport) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin");
        return;
      }

      const response = await fetch(`${API_URL}/api/sports/${sport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sport.name,
          description: sport.description,
          icon: sport.icon,
          active: !sport.active,
          displayOrder: sport.displayOrder,
          primaryStat: sport.primaryStat,
          winPoints: sport.winPoints,
          drawPoints: sport.drawPoints,
          lossPoints: sport.lossPoints,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sport status");
      }

      const updatedSport = await response.json();

      setSports((current) =>
        current
          .map((item) =>
            item.id === sport.id ? updatedSport : item
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );

      setSuccess(
        `${sport.name} is now ${updatedSport.active ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update sport status"
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
              className="flex h-11 w-11 items-center justify-center border-2 border-[#063b32] bg-[#fbf5e8] shadow-[4px_4px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#063b32]"
            >
              <ArrowLeft size={21} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                <Trophy size={15} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 text-3xl font-black uppercase tracking-tight lg:text-4xl">
                Sports
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-3 text-sm font-black uppercase tracking-wide text-[#fff7e8] shadow-[4px_4px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#063b32]"
          >
            <Plus size={19} />
            Add Sport
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-6 text-[#fff7e8] shadow-[6px_6px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
              Total Sports
            </p>
            <p className="mt-3 text-5xl font-black">
              {sports.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-6 shadow-[6px_6px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">
              Active
            </p>
            <p className="mt-3 text-5xl font-black">
              {sports.filter((sport) => sport.active).length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-6 shadow-[6px_6px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">
              Inactive
            </p>
            <p className="mt-3 text-5xl font-black">
              {sports.filter((sport) => !sport.active).length}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-55">
              Competition Setup
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase">
              Manage Sports
            </h2>
          </div>

          <div className="relative w-full md:w-[360px]">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH SPORTS..."
              className="w-full border-2 border-[#063b32] bg-[#fbf5e8] py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-wide outline-none shadow-[4px_4px_0_#063b32] placeholder:opacity-40 focus:shadow-[6px_6px_0_#063b32]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-sm font-bold text-[#fff7e8] shadow-[4px_4px_0_#063b32]">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center justify-between gap-4 border-2 border-[#063b32] bg-[#d7c85f] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#063b32]">
            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <section className="mt-8 border-2 border-[#063b32] bg-[#fbf5e8] shadow-[6px_6px_0_#063b32]">
          <div className="hidden grid-cols-[50px_1.4fr_1.4fr_120px_110px_110px_110px_150px] border-b-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#fff7e8] lg:grid">
            <div></div>
            <div>Sport</div>
            <div>Primary Stat</div>
            <div>Order</div>
            <div>Win</div>
            <div>Draw</div>
            <div>Loss</div>
            <div>Status</div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-50">
                Loading sports...
              </p>
            </div>
          ) : filteredSports.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8]">
                <Trophy size={28} />
              </div>

              <h3 className="mt-5 text-xl font-black uppercase">
                No Sports Found
              </h3>

              <p className="mt-2 text-sm font-semibold opacity-60">
                Add your first Freshers&apos; Cup sport.
              </p>
            </div>
          ) : (
            <div>
              {filteredSports.map((sport, index) => (
                <div
                  key={sport.id}
                  className={`grid items-center border-b-2 border-[#063b32] px-5 py-5 last:border-b-0 lg:grid-cols-[50px_1.4fr_1.4fr_120px_110px_110px_110px_150px] ${
                    index % 2 === 0 ? "bg-[#fbf5e8]" : "bg-[#f0e5cf]"
                  }`}
                >
                  <div className="hidden lg:block">
                    <GripVertical size={19} className="opacity-35" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-xl font-black text-[#fff7e8]">
                        {sport.icon || sport.name.slice(0, 1).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-lg font-black uppercase">
                          {sport.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold opacity-50">
                          ID #{sport.id}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 max-w-[420px] text-sm font-medium opacity-65 lg:hidden">
                      {sport.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <p className="text-xs font-bold uppercase opacity-45 lg:hidden">
                      Primary Stat
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase">
                      {sport.primaryStat || "Not set"}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <p className="text-xs font-bold uppercase opacity-45 lg:hidden">
                      Display Order
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {sport.displayOrder}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <p className="text-xs font-bold uppercase opacity-45 lg:hidden">
                      Win Points
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {sport.winPoints}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <p className="text-xs font-bold uppercase opacity-45 lg:hidden">
                      Draw Points
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {sport.drawPoints}
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <p className="text-xs font-bold uppercase opacity-45 lg:hidden">
                      Loss Points
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {sport.lossPoints}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 lg:mt-0 lg:justify-end">
                    <button
                      onClick={() => toggleSport(sport)}
                      className={`flex items-center gap-2 border-2 border-[#063b32] px-3 py-2 text-xs font-black uppercase ${
                        sport.active
                          ? "bg-[#d7c85f]"
                          : "bg-[#d9cebb]"
                      }`}
                    >
                      {sport.active && <Check size={14} />}
                      {sport.active ? "Active" : "Inactive"}
                    </button>

                    <button
                      onClick={() => openEditModal(sport)}
                      className="flex h-10 w-10 items-center justify-center border-2 border-[#063b32] bg-[#fff7e8]"
                      title="Edit"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      onClick={() => deleteSport(sport)}
                      className="flex h-10 w-10 items-center justify-center border-2 border-[#063b32] bg-[#e85a4f] text-[#fff7e8]"
                      title="Delete"
                    >
                      <Trash2 size={17} />
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
            <div className="sticky top-0 flex items-center justify-between border-b-2 border-[#063b32] bg-[#104c41] px-6 py-5 text-[#fff7e8]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
                  Freshers&apos; Cup
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase">
                  {editingSport ? "Edit Sport" : "Add Sport"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center border-2 border-[#fff7e8]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-6">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em]">
                  Sport Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Football"
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em]">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Describe the sport..."
                  rows={3}
                  className="mt-2 w-full resize-none border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-medium outline-none"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em]">
                    Icon
                  </label>

                  <input
                    value={form.icon}
                    onChange={(e) => updateField("icon", e.target.value)}
                    placeholder="⚽"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em]">
                    Primary Stat
                  </label>

                  <input
                    value={form.primaryStat}
                    onChange={(e) =>
                      updateField("primaryStat", e.target.value)
                    }
                    placeholder="Goals / Runs / Points"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em]">
                  Display Order
                </label>

                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    updateField("displayOrder", Number(e.target.value))
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-bold outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em]">
                  Standing Points
                </p>

                <div className="mt-2 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Win
                    </label>
                    <input
                      type="number"
                      value={form.winPoints}
                      onChange={(e) =>
                        updateField("winPoints", Number(e.target.value))
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Draw
                    </label>
                    <input
                      type="number"
                      value={form.drawPoints}
                      onChange={(e) =>
                        updateField("drawPoints", Number(e.target.value))
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Loss
                    </label>
                    <input
                      type="number"
                      value={form.lossPoints}
                      onChange={(e) =>
                        updateField("lossPoints", Number(e.target.value))
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-3 text-base font-black outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => updateField("active", !form.active)}
                className="flex items-center justify-between border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4"
              >
                <div className="text-left">
                  <p className="text-sm font-black uppercase">
                    Active Sport
                  </p>
                  <p className="mt-1 text-xs font-semibold opacity-55">
                    Show this sport on the public website.
                  </p>
                </div>

                <div
                  className={`flex h-7 w-12 items-center border-2 border-[#063b32] p-1 ${
                    form.active ? "bg-[#d7c85f]" : "bg-[#d9cebb]"
                  }`}
                >
                  <div
                    className={`h-4 w-4 border-2 border-[#063b32] bg-[#063b32] transition-transform ${
                      form.active ? "translate-x-5" : ""
                    }`}
                  />
                </div>
              </button>

              {error && (
                <div className="border-2 border-[#063b32] bg-[#e85a4f] px-4 py-3 text-sm font-bold text-[#fff7e8]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#d9cebb] px-5 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveSport}
                  disabled={saving}
                  className="flex-1 border-2 border-[#063b32] bg-[#104c41] px-5 py-3 text-sm font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingSport
                    ? "Save Changes"
                    : "Create Sport"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}