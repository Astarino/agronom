"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare2, Layers3, MousePointer2, Plus, Sprout, Sun, Moon, Trash2, X } from "lucide-react";
import { ContainerCell } from "./ContainerCell";
import { ContainerModal } from "./ContainerModal";
import { BulkPlantModal } from "./BulkPlantModal";
import { cn } from "@/lib/utils";

type Species = { id: string; name: string; color: string; variety: string | null };

type ContainerData = {
  id: string; position: number; stage: string; emoji: string | null; species: Species | null;
  plantedAt: Date | null; darkPhaseStarted: Date | null;
  lightPhaseStarted: Date | null; harvestedAt: Date | null; notes: string | null;
};

type TrayData = { id: string; position: number; containers: ContainerData[] };

type LevelData = {
  id: string; levelNumber: number;
  lightOnTime: string; lightOffTime: string; lightActive: boolean;
  lightHeight: number | null;
  trays: TrayData[];
};

type ShelfData = {
  id: string; name: string;
  levels: LevelData[];
};

export function ShelfView({ shelf, species }: { shelf: ShelfData; species: Species[] }) {
  const router = useRouter();
  const [selectedContainer, setSelectedContainer] = useState<ContainerData | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPlantOpen, setBulkPlantOpen] = useState(false);
  const [toast, setToast] = useState("");
  // Optimistic light state so the lamp "turns on" instantly on tap.
  const [lightOverride, setLightOverride] = useState<Record<string, boolean>>({});

  const allContainers = shelf.levels.flatMap((level) => level.trays.flatMap((tray) => tray.containers));
  const emptyContainers = allContainers.filter((container) => container.stage === "EMPTY");

  function onRefresh() {
    router.refresh();
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  function toggleSelectionMode() {
    setSelectionMode((current) => {
      if (current) setSelectedIds(new Set());
      return !current;
    });
    setSelectedContainer(null);
  }

  function toggleContainer(container: ContainerData) {
    if (!selectionMode) {
      setSelectedContainer(container);
      return;
    }
    if (container.stage !== "EMPTY") return;

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(container.id)) next.delete(container.id);
      else next.add(container.id);
      return next;
    });
  }

  function toggleScope(containers: ContainerData[]) {
    const emptyIds = containers.filter((container) => container.stage === "EMPTY").map((container) => container.id);
    if (!emptyIds.length) return;

    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = emptyIds.every((id) => next.has(id));
      emptyIds.forEach((id) => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }

  function scopeIsSelected(containers: ContainerData[]) {
    const emptyIds = containers.filter((container) => container.stage === "EMPTY").map((container) => container.id);
    return emptyIds.length > 0 && emptyIds.every((id) => selectedIds.has(id));
  }

  function finishBulkPlant(message: string) {
    setBulkPlantOpen(false);
    setSelectionMode(false);
    setSelectedIds(new Set());
    showToast(message);
    router.refresh();
  }

  async function toggleLight(levelId: string, current: boolean) {
    setLightOverride((map) => ({ ...map, [levelId]: !current }));
    try {
      await fetch(`/api/levels/${levelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lightActive: !current }),
      });
    } finally {
      router.refresh();
    }
  }

  async function addTray(levelId: string) {
    await fetch("/api/trays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelId }),
    });
    router.refresh();
  }

  async function deleteLevel(levelId: string) {
    if (!confirm("Удалить этаж? Активные посевы сохранятся в истории.")) return;
    await fetch(`/api/levels/${levelId}`, { method: "DELETE" });
    router.refresh();
  }

  async function deleteTray(trayId: string) {
    if (!confirm("Удалить поднос? Активные посевы сохранятся в истории.")) return;
    await fetch(`/api/trays/${trayId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="ui-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: selectionMode ? "rgba(135, 189, 156,.14)" : "var(--surface)",
              color: selectionMode ? "var(--green-sprout)" : "var(--text-muted)",
            }}>
            {selectionMode ? <CheckSquare2 size={17} /> : <MousePointer2 size={17} />}
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {selectionMode ? "Выберите свободные контейнеры" : "Управление контейнерами"}
            </div>
            <div className="mt-0.5 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
              {selectionMode
                ? `Выбрано ${selectedIds.size} из ${emptyContainers.length} свободных`
                : "Нажмите на ячейку для просмотра или включите массовую посадку"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectionMode && (
            <button
              onClick={() => toggleScope(emptyContainers)}
              disabled={!emptyContainers.length}
              className="ui-button-secondary flex-1 sm:flex-none disabled:opacity-40"
            >
              <Layers3 size={15} />
              {emptyContainers.every((container) => selectedIds.has(container.id)) && emptyContainers.length
                ? "Снять все"
                : "Все свободные"}
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            disabled={!emptyContainers.length && !selectionMode}
            className={selectionMode ? "ui-button-secondary flex-1 sm:flex-none" : "ui-button-primary flex-1 sm:flex-none"}
          >
            {selectionMode ? <X size={15} /> : <Sprout size={15} />}
            {selectionMode ? "Отменить выбор" : "Массовая посадка"}
          </button>
        </div>
      </div>

      <div className="ui-card overflow-hidden">
        {shelf.levels.map((level, li) => {
          const lit = lightOverride[level.id] ?? level.lightActive;
          return (
          <div key={level.id}
            className={cn("relative overflow-hidden", li < shelf.levels.length - 1 && "border-b")}
            style={{ borderColor: "var(--border)" }}>

            {/* Grow-light backlight — warm glow that fades in when light is on */}
            <div aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-0 transition-opacity duration-700 ease-out"
              style={{
                height: "78%",
                opacity: lit ? 1 : 0,
                background: "radial-gradient(125% 88% at 50% 0%, rgba(255,226,170,.16), rgba(255,214,150,.045) 46%, transparent 72%)",
              }} />
            <div aria-hidden
              className="pointer-events-none absolute inset-x-5 top-0 z-0 h-[3px] rounded-b-full transition-all duration-700 ease-out"
              style={{
                opacity: lit ? 1 : 0,
                background: "linear-gradient(90deg, transparent, #ffe6a8 28%, #fff3d2 50%, #ffe6a8 72%, transparent)",
                boxShadow: lit ? "0 0 14px 2px rgba(255,226,170,.5)" : "none",
              }} />

            <div className="relative z-10 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: "rgba(255,255,255,.012)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold"
                  style={{ background: "var(--surface-raised)", color: "var(--text-secondary)" }}>
                  {level.levelNumber}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Этаж {level.levelNumber}
                </span>
                {level.lightHeight && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Свет {level.lightHeight} см
                  </span>
                )}
                {selectionMode && (
                  <button
                    onClick={() => toggleScope(level.trays.flatMap((tray) => tray.containers))}
                    className="ml-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-white/[0.03]"
                    style={{ color: "var(--green-sprout)", borderColor: "rgba(135, 189, 156,.18)" }}
                  >
                    {scopeIsSelected(level.trays.flatMap((tray) => tray.containers)) ? "Снять этаж" : "Выбрать этаж"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="mr-auto whitespace-nowrap font-mono text-[10px] sm:mr-0" style={{ color: "var(--text-muted)" }}>
                  {level.lightOnTime}–{level.lightOffTime}
                </span>
                <button
                  onClick={() => toggleLight(level.id, lit)}
                  aria-pressed={lit}
                  className={cn(
                    "flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1 text-xs font-semibold transition-all duration-300",
                    lit
                      ? "border-[#d4b878]/35 bg-[#d4b878]/15 text-[#e6cd96]"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-[#d4b878]/25"
                  )}
                  style={lit ? { boxShadow: "0 0 12px rgba(255,226,170,.28)" } : undefined}
                >
                  {lit ? <Sun size={12} /> : <Moon size={12} />}
                  {lit ? "Свет ВКЛ" : "Свет ВЫКЛ"}
                </button>
                <button
                  onClick={() => deleteLevel(level.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-red-500/10"
                  style={{ color: "var(--danger)", borderColor: "rgba(239,119,119,.14)" }}
                  title="Удалить этаж"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="relative z-10 p-3 transition-[filter] duration-700 ease-out sm:p-4"
              style={{ filter: lit ? "brightness(1.05)" : "none" }}>
              <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {level.trays.map((tray) => (
                  <div key={tray.id} className="min-w-[250px] snap-start rounded-xl border p-3 sm:min-w-0"
                    style={{ background: "rgba(255,255,255,.012)", borderColor: "var(--border)" }}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Поднос {tray.position}
                      </div>
                      {selectionMode ? (
                        <button
                          onClick={() => toggleScope(tray.containers)}
                          className="rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-white/[0.03]"
                          style={{ color: "var(--green-sprout)", borderColor: "rgba(135, 189, 156,.18)" }}
                        >
                          {scopeIsSelected(tray.containers) ? "Снять поднос" : "Выбрать поднос"}
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteTray(tray.id)}
                          className="rounded-md p-1 transition-colors hover:bg-red-500/10"
                          style={{ color: "rgba(239,119,119,.65)" }}
                          title="Удалить поднос"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {tray.containers.map((container) => (
                        <ContainerCell
                          key={container.id}
                          container={container}
                          selectionMode={selectionMode}
                          selected={selectedIds.has(container.id)}
                          onClick={() => toggleContainer(container)}
                        />
                      ))}
                      {/* Add container button if < 4 */}
                      {!selectionMode && tray.containers.length < 4 && (
                        <AddContainerCell trayId={tray.id} position={tray.containers.length + 1} onAdded={onRefresh} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Add tray if < 2 */}
                {!selectionMode && level.trays.length < 2 && (
                  <button
                    onClick={() => addTray(level.id)}
                    className="flex min-h-[112px] min-w-[180px] snap-start flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors hover:bg-white/[0.03] sm:min-w-0"
                    style={{ borderColor: "var(--border)" }}>
                    <Plus size={16} style={{ color: "var(--text-muted)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Поднос</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {!selectionMode && <button
        onClick={async () => {
          await fetch(`/api/levels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shelfId: shelf.id }),
          });
          router.refresh();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-colors hover:bg-white/[0.03]"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <Plus size={16} /> Добавить этаж
      </button>}

      {selectedContainer && !selectionMode && (
        <ContainerModal
          container={selectedContainer}
          species={species}
          shelfName={shelf.name}
          onClose={() => setSelectedContainer(null)}
          onUpdate={onRefresh}
        />
      )}

      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed inset-x-3 bottom-[84px] z-50 mx-auto max-w-xl rounded-2xl border p-3 shadow-2xl lg:bottom-6 lg:left-[248px]"
          style={{ background: "rgba(16,27,20,.96)", borderColor: "rgba(135, 189, 156,.25)", backdropFilter: "blur(18px)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold"
              style={{ background: "rgba(135, 189, 156,.14)", color: "var(--green-sprout)" }}>
              {selectedIds.size}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Контейнеры выбраны</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Укажите вид и дату одним действием</div>
            </div>
            <button onClick={() => setBulkPlantOpen(true)} className="ui-button-primary">
              <Sprout size={16} />
              Посадить
            </button>
          </div>
        </div>
      )}

      {bulkPlantOpen && (
        <BulkPlantModal
          selectedIds={[...selectedIds]}
          species={species}
          onClose={() => setBulkPlantOpen(false)}
          onSuccess={finishBulkPlant}
        />
      )}

      {toast && (
        <div role="status" className="fixed right-4 top-20 z-[80] flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl lg:top-6"
          style={{ background: "var(--surface-raised)", borderColor: "rgba(135, 189, 156,.25)", color: "var(--green-sprout)" }}>
          <CheckSquare2 size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function AddContainerCell({ trayId, position, onAdded }: {
  trayId: string; position: number; onAdded: () => void;
}) {
  async function handleAdd() {
    await fetch("/api/containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trayId, position }),
    });
    onAdded();
  }

  return (
    <button
      onClick={handleAdd}
      className="aspect-square rounded-xl border border-dashed flex items-center justify-center transition-colors hover:border-[color:var(--border-light)] hover:bg-white/[0.03]"
      style={{ borderColor: "var(--border)" }}
    >
      <Plus size={14} style={{ color: "var(--text-muted)" }} />
    </button>
  );
}
