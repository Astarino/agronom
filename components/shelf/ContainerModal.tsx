"use client";

import { useState } from "react";
import { X, ArrowRight, Droplets, Sun, Scissors, Trash2, ClipboardList } from "lucide-react";
import { STAGE_LABELS, GrowthStage, daysSince, formatDate } from "@/lib/utils";
import Link from "next/link";

type Species = { id: string; name: string; color: string; variety: string | null };

type ContainerData = {
  id: string; position: number; stage: string; species: Species | null;
  plantedAt: Date | null; darkPhaseStarted: Date | null;
  lightPhaseStarted: Date | null; harvestedAt: Date | null; notes: string | null;
};

const NEXT_STAGE_LABELS: Partial<Record<GrowthStage, string>> = {
  EMPTY: "Начать посев",
  PREPARATION: "В тёмную фазу",
  DARK_PHASE: "Под свет",
  LIGHT_PHASE: "Отметить готовым",
  READY: "Убрано / Собрано",
};

const STAGE_ICONS: Partial<Record<GrowthStage, React.ReactNode>> = {
  EMPTY: <ArrowRight size={14} />,
  PREPARATION: <ArrowRight size={14} />,
  DARK_PHASE: <Sun size={14} />,
  LIGHT_PHASE: <ArrowRight size={14} />,
  READY: <Scissors size={14} />,
};

export function ContainerModal({ container, species, shelfName, onClose, onUpdate }: {
  container: ContainerData;
  species: Species[];
  shelfName: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [selectedSpecies, setSelectedSpecies] = useState(container.species?.id ?? "");
  const [notes, setNotes] = useState(container.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"info" | "log">("info");

  const stage = container.stage as GrowthStage;
  const days = container.plantedAt ? daysSince(container.plantedAt) : null;
  const nextLabel = NEXT_STAGE_LABELS[stage];
  const nextIcon = STAGE_ICONS[stage];

  async function advanceStage() {
    setLoading(true);
    try {
      await fetch(`/api/containers/${container.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId: selectedSpecies || undefined }),
      });
      onUpdate();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes() {
    await fetch(`/api/containers/${container.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, speciesId: selectedSpecies || null }),
    });
    onUpdate();
    onClose();
  }

  async function logWatering() {
    await fetch(`/api/containers/${container.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "Полив", stage }),
    });
    onUpdate();
  }

  async function clearContainer() {
    if (!confirm("Очистить контейнер?")) return;
    await fetch(`/api/containers/${container.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "EMPTY", speciesId: null, notes: null, plantedAt: null }),
    });
    onUpdate();
    onClose();
  }

  const stageColor = {
    EMPTY: "#4A6B4E", PREPARATION: "#A78BFA", DARK_PHASE: "#C4B5FD",
    LIGHT_PHASE: "#4ADE80", READY: "#FCD34D", HARVESTED: "#4A6B4E",
  }[stage] ?? "#4A6B4E";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(7,15,9,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-sprout"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            {container.species && (
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: container.species.color }} />
            )}
            <div>
              <div className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
                {container.species?.name ?? "Свободный контейнер"}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {shelfName} · Позиция {container.position}
                {days !== null && ` · День ${days}`}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Stage badge */}
        <div className="px-4 pt-3 pb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: `${stageColor}22`, color: stageColor, border: `1px solid ${stageColor}44` }}>
            {STAGE_LABELS[stage]}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4" style={{ borderColor: "var(--border)" }}>
          {(["info", "log"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-2 text-xs font-medium border-b-2 transition-colors"
              style={{
                borderColor: tab === t ? "var(--green-sprout)" : "transparent",
                color: tab === t ? "var(--green-sprout)" : "var(--text-muted)",
              }}>
              {t === "info" ? "Информация" : "Журнал"}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {tab === "info" ? (
            <>
              {/* Species selector */}
              {stage === "EMPTY" && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Вид растения
                  </label>
                  <select
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">— Выберите вид —</option>
                    {species.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Заметки
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Добавьте заметки..."
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Dates */}
              {container.plantedAt && (
                <div className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
                  <div>🌱 Посеяно: {formatDate(container.plantedAt)}</div>
                  {container.darkPhaseStarted && <div>🌑 Тёмная фаза: {formatDate(container.darkPhaseStarted)}</div>}
                  {container.lightPhaseStarted && <div>☀️ Под светом: {formatDate(container.lightPhaseStarted)}</div>}
                </div>
              )}

              {/* Species instructions link */}
              {container.species && (
                <Link href={`/species/${container.species.id}`}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.2)" }}>
                  <ClipboardList size={12} />
                  Смотреть инструкцию для {container.species.name}
                </Link>
              )}
            </>
          ) : (
            <ContainerLogTab containerId={container.id} />
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {stage !== "EMPTY" && stage !== "HARVESTED" && (
              <button
                onClick={logWatering}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ background: "rgba(74,222,128,0.1)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.2)" }}>
                <Droplets size={12} /> Полив
              </button>
            )}

            <button onClick={saveNotes}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Сохранить
            </button>

            {nextLabel && (
              <button
                onClick={advanceStage}
                disabled={loading || (stage === "EMPTY" && !selectedSpecies)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                style={{
                  background: stage === "READY" ? "rgba(252,211,77,0.15)" : "rgba(74,222,128,0.15)",
                  color: stage === "READY" ? "#FCD34D" : "var(--green-sprout)",
                  border: `1px solid ${stage === "READY" ? "rgba(252,211,77,0.3)" : "rgba(74,222,128,0.3)"}`,
                }}>
                {nextIcon}
                {nextLabel}
              </button>
            )}
          </div>

          {/* Clear */}
          {stage !== "EMPTY" && (
            <button onClick={clearContainer}
              className="w-full py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors hover:bg-red-500/10"
              style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Trash2 size={12} /> Очистить контейнер
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContainerLogTab({ containerId }: { containerId: string }) {
  const [logs, setLogs] = useState<Array<{ id: string; action: string; createdAt: Date; notes: string | null }>>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/containers/${containerId}/log`)
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoaded(true); });
    return <div className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Загрузка...</div>;
  }

  if (logs.length === 0) {
    return <div className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Нет записей в журнале</div>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 text-xs">
          <span className="w-20 flex-shrink-0 font-mono" style={{ color: "var(--text-muted)" }}>
            {new Date(log.createdAt).toLocaleDateString("ru", { day: "numeric", month: "short" })}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>{log.action}</span>
          {log.notes && <span style={{ color: "var(--text-muted)" }}>— {log.notes}</span>}
        </div>
      ))}
    </div>
  );
}
