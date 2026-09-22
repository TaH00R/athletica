"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Edit3,
  GripVertical,
  Plus,
  Search,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import { api } from "@/lib/api";
import type { Sport, SportRequest } from "@/types";

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
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] =
    useState<Sport | null>(null);
  const [form, setForm] = useState<SportForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredSports = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return sports;
    }

    return sports.filter((sport) => {
      return (
        sport.name.toLowerCase().includes(value) ||
        sport.primaryStat
          ?.toLowerCase()
          .includes(value) ||
        sport.description
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [search, sports]);

  const activeCount = sports.filter(
    (sport) => sport.active
  ).length;

  const inactiveCount = sports.filter(
    (sport) => !sport.active
  ).length;

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin");
      return;
    }

    loadSports();
  }, [router]);

  async function loadSports() {
    try {
      setLoading(true);
      setError("");

      const data = await api.sports.getAll();

      setSports(
        [...data].sort(
          (a, b) =>
            a.displayOrder - b.displayOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load sports"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingSport(null);

    const nextOrder =
      sports.length > 0
        ? Math.max(
            ...sports.map(
              (sport) => sport.displayOrder
            )
          ) + 1
        : 0;

    setForm({
      ...emptyForm,
      displayOrder: nextOrder,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(sport: Sport) {
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
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingSport(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField<K extends keyof SportForm>(
    field: K,
    value: SportForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveSport() {
    if (!form.name.trim()) {
      setError("Sport name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: SportRequest = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        icon: form.icon.trim() || null,
        active: form.active,
        displayOrder: Number(
          form.displayOrder
        ),
        primaryStat:
          form.primaryStat.trim() || null,
        winPoints: Number(form.winPoints),
        drawPoints: Number(form.drawPoints),
        lossPoints: Number(form.lossPoints),
      };

      const savedSport = editingSport
        ? await api.sports.update(
            editingSport.id,
            payload
          )
        : await api.sports.create(payload);

      if (editingSport) {
        setSports((current) =>
          [...current]
            .map((sport) =>
              sport.id === editingSport.id
                ? savedSport
                : sport
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            )
        );

        setSuccess(
          "Sport updated successfully."
        );
      } else {
        setSports((current) =>
          [...current, savedSport].sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          )
        );

        setSuccess(
          "Sport added successfully."
        );
      }

      setShowModal(false);
      setEditingSport(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save sport"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSport(sport: Sport) {
    const confirmed = window.confirm(
      `Delete "${sport.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.sports.delete(sport.id);

      setSports((current) =>
        current.filter(
          (item) => item.id !== sport.id
        )
      );

      setSuccess(
        `${sport.name} deleted successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete sport"
      );
    }
  }

  async function toggleSport(sport: Sport) {
    try {
      setError("");
      setSuccess("");

      const updatedSport =
        await api.sports.update(
          sport.id,
          {
            name: sport.name,
            description: sport.description,
            icon: sport.icon,
            active: !sport.active,
            displayOrder: sport.displayOrder,
            primaryStat: sport.primaryStat,
            winPoints: sport.winPoints,
            drawPoints: sport.drawPoints,
            lossPoints: sport.lossPoints,
          }
        );

      setSports((current) =>
        current
          .map((item) =>
            item.id === sport.id
              ? updatedSport
              : item
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          )
      );

      setSuccess(
        `${sport.name} is now ${
          updatedSport.active
            ? "active"
            : "inactive"
        }.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update sport status"
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
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 min-[420px]:text-xs sm:text-sm sm:tracking-[0.2em]">
                <Trophy size={15} />
                Freshers&apos; Cup
              </div>

              <h1 className="mt-1 truncate text-3xl font-black uppercase tracking-tight min-[420px]:text-4xl lg:text-5xl">
                Sports
              </h1>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-5 py-4 text-base font-black uppercase tracking-wide text-[#fff7e8] shadow-[5px_5px_0_#063b32] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#063b32] sm:px-6 lg:w-auto"
          >
            <Plus size={20} />
            Add Sport
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-[#063b32] bg-[#104c41] p-5 text-[#fff7e8] shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32] min-[420px]:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70 sm:text-sm sm:tracking-[0.18em]">
              Total Sports
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {sports.length}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Active
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {activeCount}
            </p>
          </div>

          <div className="border-2 border-[#063b32] bg-[#fbf5e8] p-5 shadow-[6px_6px_0_#063b32] sm:p-7 sm:shadow-[7px_7px_0_#063b32]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 sm:text-sm">
              Inactive
            </p>

            <p className="mt-3 text-5xl font-black sm:text-6xl">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-55 sm:text-sm sm:tracking-[0.2em]">
              Competition Setup
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
              Manage Sports
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
              placeholder="SEARCH SPORTS..."
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
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <p className="text-sm font-bold uppercase tracking-[0.15em] opacity-50 sm:text-base">
                Loading sports...
              </p>
            </div>
          ) : filteredSports.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-[#fff7e8] sm:h-20 sm:w-20">
                <Trophy size={30} />
              </div>

              <h3 className="mt-5 text-xl font-black uppercase sm:text-2xl">
                No Sports Found
              </h3>

              <p className="mt-2 text-sm font-semibold opacity-60 sm:text-base">
                Add your first Freshers&apos; Cup sport.
              </p>
            </div>
          ) : (
            <div>
              {filteredSports.map(
                (sport, index) => (
                  <div
                    key={sport.id}
                    className={`border-b-2 border-[#063b32] last:border-b-0 ${
                      index % 2 === 0
                        ? "bg-[#fbf5e8]"
                        : "bg-[#f0e5cf]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:grid lg:grid-cols-[50px_1.4fr_1.4fr_120px_110px_110px_110px_150px] lg:items-center lg:gap-0">
                      <div className="hidden lg:block">
                        <GripVertical
                          size={19}
                          className="opacity-35"
                        />
                      </div>

                      <div>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#063b32] bg-[#104c41] text-xl font-black text-[#fff7e8]">
                            {sport.icon ||
                              sport.name
                                .slice(0, 1)
                                .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-lg font-black uppercase sm:text-xl">
                              {sport.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold opacity-50">
                              ID #{sport.id}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 break-words text-sm font-medium opacity-65 lg:hidden">
                          {sport.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Primary Stat
                        </p>

                        <p className="mt-1 break-words text-sm font-bold uppercase sm:text-base">
                          {sport.primaryStat ||
                            "Not set"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Display Order
                        </p>

                        <p className="mt-1 text-sm font-black sm:text-base">
                          {sport.displayOrder}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Win Points
                        </p>

                        <p className="mt-1 text-sm font-black sm:text-base">
                          {sport.winPoints}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Draw Points
                        </p>

                        <p className="mt-1 text-sm font-black sm:text-base">
                          {sport.drawPoints}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-45 lg:hidden">
                          Loss Points
                        </p>

                        <p className="mt-1 text-sm font-black sm:text-base">
                          {sport.lossPoints}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                        <button
                          onClick={() =>
                            toggleSport(sport)
                          }
                          className={`flex min-h-11 flex-1 items-center justify-center gap-2 border-2 border-[#063b32] px-3 py-2 text-xs font-black uppercase sm:flex-none ${
                            sport.active
                              ? "bg-[#d7c85f]"
                              : "bg-[#d9cebb]"
                          }`}
                        >
                          {sport.active && (
                            <Check size={14} />
                          )}
                          {sport.active
                            ? "Active"
                            : "Inactive"}
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(sport)
                          }
                          className="flex h-11 flex-1 items-center justify-center gap-2 border-2 border-[#063b32] bg-[#fff7e8] px-4 text-sm font-black uppercase sm:flex-none sm:w-11 sm:px-0"
                        >
                          <Edit3 size={17} />

                          <span className="sm:hidden">
                            Edit
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            deleteSport(sport)
                          }
                          className="flex h-11 flex-1 items-center justify-center gap-2 border-2 border-[#063b32] bg-[#e85a4f] px-4 text-sm font-black uppercase text-[#fff7e8] sm:flex-none sm:w-11 sm:px-0"
                        >
                          <Trash2 size={17} />

                          <span className="sm:hidden">
                            Delete
                          </span>
                        </button>
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
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70 sm:text-sm">
                  Freshers&apos; Cup
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
                  {editingSport
                    ? "Edit Sport"
                    : "Add Sport"}
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
                  Sport Name
                </label>

                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Football"
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the sport..."
                  rows={4}
                  className="mt-2 w-full resize-none border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                    Icon
                  </label>

                  <input
                    value={form.icon}
                    onChange={(e) =>
                      updateField(
                        "icon",
                        e.target.value
                      )
                    }
                    placeholder="⚽"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                    Primary Stat
                  </label>

                  <input
                    value={form.primaryStat}
                    onChange={(e) =>
                      updateField(
                        "primaryStat",
                        e.target.value
                      )
                    }
                    placeholder="Goals / Runs / Points"
                    className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Display Order
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) =>
                    updateField(
                      "displayOrder",
                      Number(e.target.value)
                    )
                  }
                  className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-bold outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
                  Standing Points
                </p>

                <div className="mt-2 grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Win
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.winPoints}
                      onChange={(e) =>
                        updateField(
                          "winPoints",
                          Number(e.target.value)
                        )
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Draw
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.drawPoints}
                      onChange={(e) =>
                        updateField(
                          "drawPoints",
                          Number(e.target.value)
                        )
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase opacity-55">
                      Loss
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={form.lossPoints}
                      onChange={(e) =>
                        updateField(
                          "lossPoints",
                          Number(e.target.value)
                        )
                      }
                      className="mt-2 w-full border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-base font-black outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  updateField(
                    "active",
                    !form.active
                  )
                }
                className="flex w-full items-center justify-between gap-4 border-2 border-[#063b32] bg-[#fbf5e8] px-4 py-4 text-left sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase sm:text-base">
                    Active Sport
                  </p>

                  <p className="mt-1 text-xs font-semibold opacity-55 sm:text-sm">
                    Show this sport on the public website.
                  </p>
                </div>

                <div
                  className={`flex h-7 w-12 shrink-0 items-center border-2 border-[#063b32] p-1 ${
                    form.active
                      ? "bg-[#d7c85f]"
                      : "bg-[#d9cebb]"
                  }`}
                >
                  <div
                    className={`h-4 w-4 border-2 border-[#063b32] bg-[#063b32] transition-transform ${
                      form.active
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </div>
              </button>

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
                  onClick={saveSport}
                  disabled={saving}
                  className="border-2 border-[#063b32] bg-[#104c41] px-5 py-4 text-base font-black uppercase text-[#fff7e8] shadow-[4px_4px_0_#063b32] disabled:opacity-50"
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