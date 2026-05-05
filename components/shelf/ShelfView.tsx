"use client";

import { useState } from "react";
import { Sun, Moon, Plus, Lightbulb, Trash2, Settings } from "lucide-react";
import { ContainerCell } from "./ContainerCell";
import { ContainerModal } from "./ContainerModal";
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
  const [selectedContainer, setSelectedContainer] = useState<ContainerData | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function onRefresh() {
    setRefreshKey((k) => k + 1);
    window.location.reload();
  }

  async function toggleLight(levelId: string, current: boolean) {
    await fetch(`/api/levels/${levelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lightActive: !current }),
    });
    window.location.reload();
  }

  async function addTray(levelId: string) {
    await fetch("/api/trays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelId }),
    });
    window.location.reload();
  }

  async function deleteLevel(levelId: string) {
    if (!confirm("Удалить этаж? Активные посевы сохранятся в истории.")) return;
    await fetch(`/api/levels/${levelId}`, { method: "DELETE" });
    window.location.reload();
  }

  async function deleteTray(trayId: string) {
    if (!confirm("Удалить поднос? Активные посевы сохранятся в истории.")) return;
    await fetch(`/api/trays/${trayId}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {/* Shelf frame */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "2px solid var(--border)" }}>

        {/* Level rows */}
        {shelf.levels.map((level, li) => (
          <div key={level.id}
            className={cn("relative", li < shelf.levels.length - 1 && "border-b")}
            style={{ borderColor: "var(--border)" }}>

            {/* Level header */}
            <div className="flex items-center justify-between px-4 py-2"
              style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: "var(--border)", color: "var(--text-muted)" }}>
                  {level.levelNumber}
                </span>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Этаж {level.levelNumber}
                </span>
                {level.lightHeight && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    · Свет на {level.lightHeight} см
                  </span>
                )}
              </div>

              {/* Light control */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {level.lightOnTime}–{level.lightOffTime}
                </span>
                <button
                  onClick={() => toggleLight(level.id, level.lightActive)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                    level.lightActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-amber-500/30"
                  )}
                >
                  {level.lightActive ? <Sun size={12} /> : <Moon size={12} />}
                  {level.lightActive ? "Свет ВКЛ" : "Свет ВЫКЛ"}
                </button>
                <button
                  onClick={() => deleteLevel(level.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                  style={{ color: "#EF444499", border: "1px solid rgba(239,68,68,0.14)" }}
                  title="Удалить этаж"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Trays grid */}
            <div className="p-4">
              <div className="flex gap-4">
                {level.trays.map((tray) => (
                  <div key={tray.id} className="flex-1 min-w-0">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Поднос {tray.position}
                      </div>
                      <button
                        onClick={() => deleteTray(tray.id)}
                        className="p-1 rounded-md transition-colors hover:bg-red-500/10"
                        style={{ color: "#EF444488" }}
                        title="Удалить поднос"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {tray.containers.map((container) => (
                        <ContainerCell
                          key={container.id}
                          container={container}
                          onClick={() => {
                            setSelectedContainer(container);
                            setSelectedLevelId(level.id);
                          }}
                        />
                      ))}
                      {/* Add container button if < 4 */}
                      {tray.containers.length < 4 && (
                        <AddContainerCell trayId={tray.id} position={tray.containers.length + 1} onAdded={onRefresh} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Add tray if < 2 */}
                {level.trays.length < 2 && (
                  <button
                    onClick={() => addTray(level.id)}
                    className="flex-1 min-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all hover:border-green-500/40 hover:bg-green-500/5"
                    style={{ borderColor: "var(--border)" }}>
                    <Plus size={16} style={{ color: "var(--text-muted)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Поднос</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add level button */}
      <button
        onClick={async () => {
          await fetch(`/api/levels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shelfId: shelf.id }),
          });
          window.location.reload();
        }}
        className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:bg-green-500/5 border-2 border-dashed"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <Plus size={16} /> Добавить этаж
      </button>

      {/* Container modal */}
      {selectedContainer && (
        <ContainerModal
          container={selectedContainer}
          species={species}
          shelfName={shelf.name}
          onClose={() => setSelectedContainer(null)}
          onUpdate={onRefresh}
        />
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
      className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all hover:border-green-500/40 hover:bg-green-500/5"
      style={{ borderColor: "var(--border)" }}
    >
      <Plus size={14} style={{ color: "var(--text-muted)" }} />
    </button>
  );
}
