"use client";

import { useEffect, useState } from "react";
import { X, Droplets, ClipboardList, ChevronRight, Trash2, Sprout, Moon, Sun } from "lucide-react";
import { STAGE_LABELS, GrowthStage, daysSince, formatDate } from "@/lib/utils";
import { IconPicker } from "./IconPicker";
import Link from "next/link";

type Species = { id: string; name: string; color: string; variety: string | null };

type ContainerData = {
  id: string; position: number; stage: string; emoji: string | null;
  species: Species | null;
  plantedAt: Date | null; darkPhaseStarted: Date | null;
  lightPhaseStarted: Date | null; harvestedAt: Date | null; notes: string | null;
};

const STAGE_NEXT_LABEL: Partial<Record<GrowthStage, string>> = {
  EMPTY: "Начать посев",
  PREPARATION: "В тёмную фазу",
  DARK_PHASE: "Под свет",
  LIGHT_PHASE: "Отметить готовым",
  READY: "Собрано — очистить",
};

const STAGE_ACCENT: Record<string, string> = {
  EMPTY: "#4A6B4E", PREPARATION: "#9a93b8", DARK_PHASE: "#aaa4c4",
  LIGHT_PHASE: "#87bd9c", READY: "#e0c98a", HARVESTED: "#4A6B4E",
};

export function ContainerModal({ container, species, shelfName, onClose, onUpdate }: {
  container: ContainerData;
  species: Species[];
  shelfName: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [selectedSpecies, setSelectedSpecies] = useState(container.species?.id ?? "");
  const [emoji, setEmoji] = useState(container.emoji ?? "");
  const [notes, setNotes] = useState(container.notes ?? "");
  const [eventAt, setEventAt] = useState(toDateTimeLocal(new Date()));
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"info" | "log">("info");

  const stage = container.stage as GrowthStage;
  const days = container.plantedAt ? daysSince(container.plantedAt) : null;
  const accent = STAGE_ACCENT[stage] ?? "#4A6B4E";
  const nextLabel = STAGE_NEXT_LABEL[stage];

  async function save() {
    await fetch(`/api/containers/${container.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: notes || null,
        emoji: emoji || null,
        speciesId: selectedSpecies || null,
      }),
    });
    onUpdate();
    onClose();
  }

  async function advance() {
    setLoading(true);
    try {
      await fetch(`/api/containers/${container.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: selectedSpecies || undefined,
          eventAt: stage === "EMPTY" ? new Date(eventAt).toISOString() : undefined,
        }),
      });
      // Save emoji+notes too
      if (emoji || notes) {
        await fetch(`/api/containers/${container.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji: emoji || null, notes: notes || null }),
        });
      }
      onUpdate();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function logWatering() {
    await fetch(`/api/containers/${container.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "Полив", stage }),
    });
  }

  async function clear() {
    if (!confirm("Очистить контейнер? Посев сохранится в истории.")) return;
    await fetch(`/api/containers/${container.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "EMPTY", speciesId: null, notes: null, emoji: null, plantedAt: null }),
    });
    onUpdate();
    onClose();
  }

  async function deleteContainer() {
    if (!confirm("Удалить контейнер? Активный посев сохранится в истории.")) return;
    await fetch(`/api/containers/${container.id}`, { method: "DELETE" });
    onUpdate();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(4,10,5,0.88)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", border: `1px solid ${accent}33` }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
          {/* Emoji pick inline */}
          {stage !== "EMPTY" && (
            <IconPicker value={emoji} onChange={setEmoji} />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {container.species?.name ?? "Свободный контейнер"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {shelfName} · поз. {container.position}
              {days !== null && <> · <span className="font-mono">день {days}</span></>}
            </div>
          </div>

          {/* Stage badge */}
          <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}>
            {STAGE_LABELS[stage]}
          </span>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 flex-shrink-0"
            style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4" style={{ borderColor: "var(--border)" }}>
          {(["info", "log"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-2 text-xs font-medium border-b-2 transition-colors"
              style={{
                borderColor: tab === t ? accent : "transparent",
                color: tab === t ? accent : "var(--text-muted)",
              }}>
              {t === "info" ? "Информация" : "Журнал"}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {tab === "info" ? (
            <>
              {/* Species selector (only when empty) */}
              {stage === "EMPTY" && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Вид растения
                  </label>
                  <select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">— Выберите вид —</option>
                    {species.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Emoji picker (when empty, show in body) */}
              {stage === "EMPTY" && selectedSpecies && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Иконка контейнера
                  </label>
                  <IconPicker value={emoji} onChange={setEmoji} />
                </div>
              )}

              {stage === "EMPTY" && selectedSpecies && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Дата и время посева
                  </label>
                  <input
                    type="datetime-local"
                    value={eventAt}
                    onChange={(e) => setEventAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Заметки
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="Например: семена из новой партии, меньше воды..."
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Timeline */}
              {container.plantedAt && (
                <div className="rounded-xl p-3 space-y-1.5"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  {container.plantedAt && <DateRow icon={<Sprout size={13} style={{ color: "#87bd9c" }} />} label="Посеяно" date={container.plantedAt} />}
                  {container.darkPhaseStarted && <DateRow icon={<Moon size={13} style={{ color: "#aaa4c4" }} />} label="Тёмная фаза" date={container.darkPhaseStarted} />}
                  {container.lightPhaseStarted && <DateRow icon={<Sun size={13} style={{ color: "#e0c98a" }} />} label="Под светом" date={container.lightPhaseStarted} />}
                </div>
              )}

              {/* Link to species */}
              {container.species && (
                <Link href={`/species/${container.species.id}`} onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                  style={{ color: "var(--green-sprout)", border: "1px solid rgba(135, 189, 156,0.18)" }}>
                  <ClipboardList size={12} />
                  Инструкция: {container.species.name}
                  <ChevronRight size={12} className="ml-auto" />
                </Link>
              )}
            </>
          ) : (
            <LogTab containerId={container.id} />
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {/* Watering */}
            {!["EMPTY", "HARVESTED"].includes(stage) && (
              <button onClick={logWatering}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(135, 189, 156,0.08)", color: "var(--green-sprout)", border: "1px solid rgba(135, 189, 156,0.2)" }}>
                <Droplets size={12} /> Полив
              </button>
            )}

            {/* Save */}
            <button onClick={save}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Сохранить
            </button>

            {/* Advance */}
            {nextLabel && (
              <button onClick={advance} disabled={loading || (stage === "EMPTY" && (!selectedSpecies || !eventAt))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-40 transition-all"
                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}>
                {loading ? "..." : nextLabel}
              </button>
            )}
          </div>

          {/* Clear */}
          <div className="grid grid-cols-2 gap-2">
            {stage !== "EMPTY" && (
              <button onClick={clear}
              className="w-full py-1.5 rounded-xl text-xs transition-colors hover:bg-red-500/8"
              style={{ color: "#EF444488", border: "1px solid rgba(239,68,68,0.15)" }}>
                Очистить
              </button>
            )}
            <button onClick={deleteContainer}
              className="w-full py-1.5 rounded-xl text-xs transition-colors hover:bg-red-500/8 flex items-center justify-center gap-1.5"
              style={{ color: "#EF4444AA", border: "1px solid rgba(239,68,68,0.15)" }}>
              <Trash2 size={12} /> Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function DateRow({ icon, label, date }: { icon: React.ReactNode; label: string; date: Date }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex items-center">{icon}</span>
      <span style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{formatDate(date)}</span>
    </div>
  );
}

function LogTab({ containerId }: { containerId: string }) {
  const [logs, setLogs] = useState<Array<{ id: string; action: string; createdAt: Date; notes: string | null }> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLogs(null);
    setError(false);

    fetch(`/api/containers/${containerId}/log`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load logs");
        return response.json();
      })
      .then((data) => {
        if (active) setLogs(data);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [containerId]);

  if (error) {
    return <p className="py-4 text-center text-xs" style={{ color: "var(--danger)" }}>Не удалось загрузить журнал</p>;
  }
  if (!logs) {
    return <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Загрузка...</p>;
  }
  if (logs.length === 0) {
    return <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Нет записей</p>;
  }
  return (
    <div className="space-y-2 max-h-44 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 text-xs">
          <span className="font-mono w-16 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
            {new Date(log.createdAt).toLocaleDateString("ru", { day: "numeric", month: "short" })}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>{log.action}</span>
          {log.notes && <span style={{ color: "var(--text-muted)" }}>— {log.notes}</span>}
        </div>
      ))}
    </div>
  );
}
