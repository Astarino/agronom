export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Archive, CalendarDays, Clock, Sprout } from "lucide-react";

async function getHistoryData() {
  const [history, active] = await Promise.all([
    prisma.cropHistory.findMany({ orderBy: { clearedAt: "desc" }, take: 100 }),
    prisma.container.findMany({
      where: { stage: { not: "EMPTY" } },
      include: {
        species: true,
        tray: { include: { level: { include: { shelf: true } } } },
      },
      orderBy: { plantedAt: "desc" },
    }),
  ]);

  const completedWithDuration = history.filter((item) => item.plantedAt && (item.harvestedAt || item.clearedAt));
  const averageDays = completedWithDuration.length
    ? Math.round(
        completedWithDuration.reduce((sum, item) => {
          const end = item.harvestedAt ?? item.clearedAt;
          return sum + Math.max(0, end.getTime() - item.plantedAt!.getTime()) / 86_400_000;
        }, 0) / completedWithDuration.length
      )
    : 0;

  const speciesCounts = history.reduce<Record<string, number>>((acc, item) => {
    acc[item.speciesName] = (acc[item.speciesName] ?? 0) + 1;
    return acc;
  }, {});

  return { history, active, averageDays, speciesCounts };
}

export default async function HistoryPage() {
  const { history, active, averageDays, speciesCounts } = await getHistoryData();
  const topSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
        <div className="page-eyebrow">Аналитика</div>
        <h1 className="page-title">История посевов</h1>
        <p className="page-description">
          Завершённые циклы сохраняются при очистке, удалении контейнера, подноса или этажа.
        </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<Archive size={18} />} label="В истории" value={history.length} color="var(--green-sprout)" />
        <StatCard icon={<Sprout size={18} />} label="Активных" value={active.length} color="#9a93b8" />
        <StatCard icon={<Clock size={18} />} label="Средний цикл" value={averageDays ? `${averageDays} д` : "—"} color="#e0c98a" />
        <StatCard icon={<CalendarDays size={18} />} label="Чаще всего" value={topSpecies?.[0] ?? "—"} color="#60A5FA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionTitle>Завершённые посевы</SectionTitle>
          {history.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{item.speciesName}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {item.shelfName} / Этаж {item.levelNumber} / Поднос {item.trayPosition} / Контейнер {item.containerPosition}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                      {durationLabel(item.plantedAt, item.harvestedAt ?? item.clearedAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                    <DateChip label="Посев" date={item.plantedAt} />
                    <DateChip label="Свет" date={item.lightPhaseStarted} />
                    <DateChip label="Сбор" date={item.harvestedAt} />
                    <DateChip label="Очищено" date={item.clearedAt} />
                  </div>
                  {item.notes && (
                    <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionTitle>Активные сейчас</SectionTitle>
          {active.length === 0 ? (
            <div className="rounded-xl p-4 text-sm text-center" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Нет активных посевов
            </div>
          ) : (
            <div className="space-y-2">
              {active.map((item) => (
                <div key={item.id} className="p-3 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.species?.name ?? "Не назначен"}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {item.tray.level.shelf.name} / Этаж {item.tray.level.levelNumber}
                  </div>
                  <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                    Посев: {item.plantedAt ? formatDate(item.plantedAt) : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="mb-3" style={{ color }}>{icon}</div>
      <div className="font-mono text-xl font-bold truncate" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </h2>
  );
}

function DateChip({ label, date }: { label: string; date: Date | null }) {
  return (
    <div className="p-2 rounded-lg" style={{ background: "var(--surface)" }}>
      <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>{label}</div>
      <div className="font-mono" style={{ color: "var(--text-secondary)" }}>{date ? formatDate(date) : "—"}</div>
    </div>
  );
}

function durationLabel(start: Date | null, end: Date | null) {
  if (!start || !end) return "—";
  return `${Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))} д`;
}

function EmptyState() {
  return (
    <div className="p-8 rounded-xl text-center" style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
      <Archive size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <div className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>История пока пустая</div>
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>Очистите завершённый контейнер, чтобы сохранить цикл.</div>
    </div>
  );
}
