import { prisma } from "@/lib/db";
import Link from "next/link";
import { Layers, Plus, ChevronRight } from "lucide-react";
import { AddShelfButton } from "@/components/shelf/AddShelfButton";

async function getShelves() {
  return prisma.shelf.findMany({
    include: {
      levels: {
        include: {
          trays: {
            include: {
              containers: {
                include: { species: true },
              },
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

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Стеллажи
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {shelves.length} стеллажей · управление размещением
          </p>
        </div>
        <AddShelfButton />
      </div>

      {shelves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
          <Layers size={48} className="mb-4" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Нет стеллажей
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Добавьте первый стеллаж для начала работы
          </p>
          <AddShelfButton variant="primary" />
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {shelves.map((shelf) => {
            const allContainers = shelf.levels.flatMap((l) =>
              l.trays.flatMap((t) => t.containers)
            );
            const active = allContainers.filter((c) => !["EMPTY", "HARVESTED"].includes(c.stage)).length;
            const ready = allContainers.filter((c) => c.stage === "READY").length;
            const total = allContainers.length;

            return (
              <Link
                key={shelf.id}
                href={`/shelves/${shelf.id}`}
                className="group block p-5 rounded-2xl transition-all hover:scale-[1.01] animate-fade-in"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {shelf.name}
                    </h2>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {shelf.levels.length} этажей · {total} контейнеров
                    </p>
                  </div>
                  <ChevronRight size={18} className="mt-1 transition-transform group-hover:translate-x-1"
                    style={{ color: "var(--text-muted)" }} />
                </div>

                {/* Mini shelf preview */}
                <MiniShelfPreview shelf={shelf} />

                {/* Stats */}
                <div className="flex gap-4 mt-4">
                  <MiniStat label="Активных" value={active} color="var(--green-sprout)" />
                  {ready > 0 && <MiniStat label="К сбору" value={ready} color="#FCD34D" urgent />}
                  <MiniStat label="Всего" value={total} color="var(--text-muted)" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniShelfPreview({ shelf }: { shelf: Awaited<ReturnType<typeof getShelves>>[0] }) {
  const stageColors: Record<string, string> = {
    EMPTY: "#1F2E22",
    PREPARATION: "#2E1A4A",
    DARK_PHASE: "#2A1535",
    LIGHT_PHASE: "#1A3A1A",
    READY: "#3D3000",
    HARVESTED: "#0A1409",
  };

  return (
    <div className="rounded-xl overflow-hidden p-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="space-y-1.5">
        {shelf.levels.map((level) => (
          <div key={level.id} className="flex items-center gap-2">
            <span className="font-mono text-xs w-4 text-right flex-shrink-0"
              style={{ color: "var(--text-muted)" }}>
              {level.levelNumber}
            </span>
            <div className="flex gap-1 flex-1">
              {level.trays.flatMap((tray) =>
                tray.containers.map((container) => (
                  <div
                    key={container.id}
                    className="flex-1 h-5 rounded"
                    title={container.species?.name ?? "Свободно"}
                    style={{
                      background: stageColors[container.stage] ?? stageColors.EMPTY,
                      border: container.stage === "READY"
                        ? "1px solid rgba(252,211,77,0.5)"
                        : "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {[
          { color: "#1A3A1A", label: "Свет" },
          { color: "#2A1535", label: "Темнота" },
          { color: "#3D3000", label: "Готово" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, urgent }: {
  label: string; value: number; color: string; urgent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {urgent && <span className="text-xs animate-pulse">⚡</span>}
      <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}
