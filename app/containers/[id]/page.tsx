import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Droplets, Sun, Moon, Scissors, Clock } from "lucide-react";
import { STAGE_LABELS, STAGE_GLOW, GrowthStage, daysSince, formatDate, formatRelative } from "@/lib/utils";

async function getContainer(id: string) {
  return prisma.container.findUnique({
    where: { id },
    include: {
      species: true,
      logs: { orderBy: { createdAt: "desc" } },
      tray: { include: { level: { include: { shelf: true } } } },
    },
  });
}

export default async function ContainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = await getContainer(id);
  if (!container) notFound();

  const stage = container.stage as GrowthStage;
  const days = container.plantedAt ? daysSince(container.plantedAt) : null;
  const glow = STAGE_GLOW[stage];
  const shelfName = container.tray.level.shelf.name;
  const levelNum = container.tray.level.levelNumber;

  const stageColors: Record<GrowthStage, string> = {
    EMPTY: "#4A6B4E", PREPARATION: "#A78BFA", DARK_PHASE: "#C4B5FD",
    LIGHT_PHASE: "#4ADE80", READY: "#FCD34D", HARVESTED: "#4A6B4E",
  };
  const stageColor = stageColors[stage];

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/shelves/${container.tray.level.shelfId}`}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          {container.species && (
            <div className="w-3 h-10 rounded-full" style={{ background: container.species.color }} />
          )}
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {container.species?.name ?? "Свободный контейнер"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {shelfName} / Этаж {levelNum} · Позиция {container.position}
              {days !== null && ` · День ${days}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stage card */}
      <div className="p-5 rounded-2xl mb-6"
        style={{
          background: "var(--card)",
          border: `1px solid ${stageColor}44`,
          boxShadow: glow !== "transparent" ? `0 0 30px ${glow}22` : undefined,
        }}>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: `${stageColor}22`, color: stageColor, border: `1px solid ${stageColor}44` }}>
            {STAGE_LABELS[stage]}
          </span>
          {days !== null && (
            <span className="font-mono text-2xl font-bold" style={{ color: stageColor }}>
              д.{days}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="progress-track mb-4">
          <div className="progress-fill"
            style={{ width: `${getProgress(stage)}%`, background: stageColor }} />
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {container.plantedAt && (
            <TimelineItem icon="🌱" label="Посеяно" date={container.plantedAt} />
          )}
          {container.darkPhaseStarted && (
            <TimelineItem icon="🌑" label="Тёмная фаза" date={container.darkPhaseStarted} />
          )}
          {container.lightPhaseStarted && (
            <TimelineItem icon="☀️" label="Под светом" date={container.lightPhaseStarted} />
          )}
          {container.harvestedAt && (
            <TimelineItem icon="✂️" label="Собрано" date={container.harvestedAt} />
          )}
        </div>
      </div>

      {/* Species info */}
      {container.species && (
        <div className="p-4 rounded-2xl mb-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Параметры вида
            </h2>
            <Link href={`/species/${container.species.id}`}
              className="text-xs" style={{ color: "var(--green-sprout)" }}>
              Инструкция →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <ParamChip label="Семян" value={`${container.species.seedAmount}г`} />
            <ParamChip label="Прижим" value={`${container.species.pressWeight}г`} />
            <ParamChip label="Высота" value={`${container.species.heightMin}–${container.species.heightMax}см`} />
            <ParamChip label="Темп." value={`${container.species.tempMin}–${container.species.tempMax}°C`} />
            <ParamChip label="Тёмная" value={`${container.species.darkDaysMin}–${container.species.darkDaysMax}д`} />
            <ParamChip label="Свет" value={`${container.species.lightDaysMin}–${container.species.lightDaysMax}д`} />
          </div>
        </div>
      )}

      {/* Notes */}
      {container.notes && (
        <div className="p-4 rounded-2xl mb-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Заметки</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{container.notes}</p>
        </div>
      )}

      {/* Growth log */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}>
          <Clock size={14} /> Журнал ({container.logs.length})
        </h2>
        {container.logs.length === 0 ? (
          <div className="p-6 text-center rounded-xl" style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Нет записей</p>
          </div>
        ) : (
          <div className="space-y-2">
            {container.logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="w-px self-stretch mt-1" style={{ background: "var(--border)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {log.action}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{log.notes}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getProgress(stage: GrowthStage): number {
  return { EMPTY: 0, PREPARATION: 15, DARK_PHASE: 40, LIGHT_PHASE: 70, READY: 95, HARVESTED: 100 }[stage] ?? 0;
}

function TimelineItem({ icon, label, date }: { icon: string; label: string; date: Date }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--surface)" }}>
      <span className="text-sm">{icon}</span>
      <div>
        <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
        <p style={{ color: "var(--text-muted)" }}>{formatDate(date)}</p>
      </div>
    </div>
  );
}

function ParamChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col p-2 rounded-lg" style={{ background: "var(--surface)" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>{label}</span>
      <span className="font-mono font-medium" style={{ color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
