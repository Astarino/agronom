export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Layers3, Sprout } from "lucide-react";
import { AddShelfButton } from "@/components/shelf/AddShelfButton";

async function getShelves() {
  return prisma.shelf.findMany({
    include: {
      levels: {
        orderBy: { levelNumber: "asc" },
        include: {
          trays: {
            orderBy: { position: "asc" },
            include: {
              containers: { orderBy: { position: "asc" }, include: { species: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export default async function ShelvesPage() {
  const shelves = await getShelves();
  const allContainers = shelves.flatMap((shelf) =>
    shelf.levels.flatMap((level) => level.trays.flatMap((tray) => tray.containers))
  );
  const active = allContainers.filter((container) => !["EMPTY", "HARVESTED"].includes(container.stage)).length;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">Размещение</div>
          <h1 className="page-title">Стеллажи</h1>
          <p className="page-description">
            {shelves.length} стеллажей · {allContainers.length} контейнеров · {active} активных посевов
          </p>
        </div>
        <AddShelfButton variant="primary" />
      </header>

      {shelves.length === 0 ? (
        <div className="ui-card flex flex-col items-center px-6 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(135, 189, 156,.1)", color: "var(--green-sprout)" }}>
            <Layers3 size={25} />
          </span>
          <h2 className="font-display text-xl font-bold">Добавьте первый стеллаж</h2>
          <p className="mb-6 mt-2 max-w-sm text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            Внутри появятся этажи, подносы и контейнеры для ведения каждого посева.
          </p>
          <AddShelfButton variant="primary" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shelves.map((shelf) => {
            const containers = shelf.levels.flatMap((level) =>
              level.trays.flatMap((tray) => tray.containers)
            );
            const activeCount = containers.filter((container) =>
              !["EMPTY", "HARVESTED"].includes(container.stage)
            ).length;
            const readyCount = containers.filter((container) => container.stage === "READY").length;
            const occupiedPercent = containers.length
              ? Math.round((activeCount / containers.length) * 100)
              : 0;

            return (
              <Link key={shelf.id} href={`/shelves/${shelf.id}`}
                className="ui-card-interactive group overflow-hidden p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {shelf.name}
                    </h2>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      {shelf.levels.length} этажей · {containers.length} контейнеров
                    </p>
                  </div>
                  <span className="ui-icon-button h-9 w-9 border-0 bg-transparent">
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                <ShelfPreview shelf={shelf} />

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <ShelfMetric label="Занято" value={`${occupiedPercent}%`} />
                  <ShelfMetric label="Активно" value={activeCount} accent="#87bd9c" />
                  <ShelfMetric label="К сбору" value={readyCount} accent={readyCount ? "#d4b878" : undefined} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShelfPreview({ shelf }: { shelf: Awaited<ReturnType<typeof getShelves>>[number] }) {
  const colors: Record<string, string> = {
    EMPTY: "#18231c",
    PREPARATION: "#39304f",
    DARK_PHASE: "#45375e",
    LIGHT_PHASE: "#235033",
    READY: "#66591f",
    HARVESTED: "#121a14",
  };

  return (
    <div className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="space-y-2">
        {shelf.levels.map((level) => (
          <div key={level.id} className="flex items-center gap-2">
            <span className="w-4 text-right font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
              {level.levelNumber}
            </span>
            <div className="grid flex-1 grid-flow-col auto-cols-fr gap-1">
              {level.trays.flatMap((tray) => tray.containers).map((container) => (
                <span key={container.id} className="h-6 rounded-md border"
                  style={{
                    background: colors[container.stage] ?? colors.EMPTY,
                    borderColor: container.stage === "READY" ? "rgba(212, 184, 120,.4)" : "rgba(255,255,255,.035)",
                  }}
                  title={container.species?.name ?? "Свободно"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Legend color="#235033" label="Свет" />
        <Legend color="#45375e" label="Темнота" />
        <Legend color="#66591f" label="Готово" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function ShelfMetric({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div>
      <div className="font-display text-lg font-bold" style={{ color: accent ?? "var(--text-primary)" }}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
