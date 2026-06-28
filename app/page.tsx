export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { GrowthStage, daysSince, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  Layers3,
  Moon,
  Plus,
  Sprout,
  Sun,
} from "lucide-react";

async function getDashboardData() {
  const [shelves, containers, notifications, speciesCount] = await Promise.all([
    prisma.shelf.findMany({ include: { levels: true } }),
    prisma.container.findMany({
      where: { stage: { not: "EMPTY" } },
      include: {
        species: true,
        tray: { include: { level: { include: { shelf: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.notificationSchedule.findMany({
      where: { isActive: true, sentAt: null },
      orderBy: { scheduledAt: "asc" },
      take: 4,
      include: { container: { include: { species: true } } },
    }),
    prisma.species.count(),
  ]);

  return {
    containers,
    notifications,
    speciesCount,
    stats: {
      totalShelves: shelves.length,
      totalLevels: shelves.reduce((sum, shelf) => sum + shelf.levels.length, 0),
      active: containers.filter((container) => container.stage !== "HARVESTED").length,
      ready: containers.filter((container) => container.stage === "READY").length,
      light: containers.filter((container) => container.stage === "LIGHT_PHASE").length,
      dark: containers.filter((container) => container.stage === "DARK_PHASE").length,
    },
  };
}

const stageMeta: Record<GrowthStage, { label: string; color: string; bg: string }> = {
  EMPTY: { label: "Свободно", color: "#6f8476", bg: "rgba(111,132,118,.1)" },
  PREPARATION: { label: "Подготовка", color: "#a39ec0", bg: "rgba(163, 158, 192,.1)" },
  DARK_PHASE: { label: "Тёмная фаза", color: "#aaa4c4", bg: "rgba(170, 164, 196,.1)" },
  LIGHT_PHASE: { label: "Под светом", color: "#87bd9c", bg: "rgba(135, 189, 156,.1)" },
  READY: { label: "К сбору", color: "#d4b878", bg: "rgba(212, 184, 120,.12)" },
  HARVESTED: { label: "Собрано", color: "#6f8476", bg: "rgba(111,132,118,.1)" },
};

export default async function DashboardPage() {
  const { containers, notifications, speciesCount, stats } = await getDashboardData();
  const date = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const attentionCount = stats.ready + notifications.length;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <div className="page-eyebrow">{date}</div>
          <h1 className="page-title">Всё растёт по плану</h1>
          <p className="page-description">
            Следите за текущими посевами, светом и ближайшими действиями в одном месте.
          </p>
        </div>
        <Link href="/shelves" className="ui-button-primary">
          <Plus size={16} />
          Открыть стеллажи
        </Link>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<Sprout size={18} />} label="Активные посевы" value={stats.active} accent="#87bd9c" />
        <MetricCard icon={<Sun size={18} />} label="Под светом" value={stats.light} accent="#d4b878" />
        <MetricCard icon={<Moon size={18} />} label="В темноте" value={stats.dark} accent="#a39ec0" />
        <MetricCard
          icon={<CheckCircle2 size={18} />}
          label="Готовы к сбору"
          value={stats.ready}
          accent={stats.ready ? "#d4b878" : "#6f8476"}
          highlighted={stats.ready > 0}
        />
      </section>

      {attentionCount > 0 && (
        <Link
          href={stats.ready > 0 ? "/shelves" : "/notifications"}
          className="mb-6 flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-white/[0.025]"
          style={{ background: "rgba(212, 184, 120,.06)", borderColor: "rgba(212, 184, 120,.2)" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(212, 184, 120,.12)", color: "var(--gold)" }}>
            <Bell size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {stats.ready > 0
                ? `${stats.ready} ${pluralize(stats.ready, "посев готов", "посева готовы", "посевов готовы")} к сбору`
                : "Есть запланированные задачи"}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {stats.ready > 0 ? "Проверьте контейнеры и отметьте собранный урожай" : "Откройте список ближайших уведомлений"}
            </div>
          </div>
          <ArrowRight size={17} style={{ color: "var(--gold)" }} />
        </Link>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-label mb-0">Текущие посевы</h2>
            <Link href="/shelves" className="text-xs font-semibold" style={{ color: "var(--green-sprout)" }}>
              Все стеллажи
            </Link>
          </div>

          {containers.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="ui-card overflow-hidden">
              {containers.slice(0, 8).map((container, index) => {
                const stage = container.stage as GrowthStage;
                const meta = stageMeta[stage];
                const days = container.plantedAt ? daysSince(container.plantedAt) : 0;

                return (
                  <Link
                    key={container.id}
                    href={`/containers/${container.id}`}
                    className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.025] sm:px-5"
                    style={{ borderTop: index ? "1px solid var(--border)" : undefined }}
                  >
                    <span className="h-10 w-1 shrink-0 rounded-full"
                      style={{ background: container.species?.color ?? "var(--text-muted)" }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {container.species?.name ?? "Вид не выбран"}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ color: meta.color, background: meta.bg }}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs" style={{ color: "var(--text-muted)" }}>
                        {container.tray.level.shelf.name} · этаж {container.tray.level.levelNumber} · день {days}
                      </div>
                    </div>
                    <span className="hidden font-mono text-xs sm:block" style={{ color: "var(--text-muted)" }}>
                      {days} дн.
                    </span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--text-muted)" }} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-label mb-0">Ближайшие задачи</h2>
              <Link href="/notifications" className="text-xs font-semibold" style={{ color: "var(--green-sprout)" }}>
                Все
              </Link>
            </div>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="ui-card p-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Ближайших задач нет
                </div>
              ) : notifications.map((notification) => (
                <div key={notification.id} className="ui-card flex gap-3 p-3.5">
                  <Clock3 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--green-sprout)" }} />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-sm font-medium leading-5" style={{ color: "var(--text-secondary)" }}>
                      {notification.message.replace(/<[^>]+>/g, "").split("\n")[0]}
                    </div>
                    <div className="mt-1 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {formatDate(notification.scheduledAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-label">Хозяйство</h2>
            <div className="ui-card divide-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <QuickLink href="/shelves" icon={<Layers3 size={17} />} label="Стеллажи"
                value={`${stats.totalShelves} · ${stats.totalLevels} этажей`} />
              <QuickLink href="/species" icon={<Sprout size={17} />} label="Виды растений"
                value={`${speciesCount} в справочнике`} />
              <QuickLink href="/settings" icon={<Bell size={17} />} label="Уведомления"
                value="Telegram и время" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, accent, highlighted = false }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  highlighted?: boolean;
}) {
  return (
    <div className="ui-card p-3.5 sm:p-4"
      style={highlighted ? { borderColor: "rgba(212, 184, 120,.28)", background: "rgba(212, 184, 120,.05)" } : undefined}>
      <div className="mb-3 flex items-center justify-between">
        <span style={{ color: accent }}>{icon}</span>
        {highlighted && <span className="status-dot" style={{ background: accent }} />}
      </div>
      <div className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function QuickLink({ href, icon, label, value }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.025]">
      <span style={{ color: "var(--green-sprout)" }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</div>
        <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{value}</div>
      </div>
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--text-muted)" }} />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="ui-card flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "rgba(135, 189, 156,.1)", color: "var(--green-sprout)" }}>
        <Sprout size={22} />
      </span>
      <div className="font-semibold">Активных посевов пока нет</div>
      <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
        Откройте свободный контейнер на стеллаже и выберите вид растения.
      </p>
      <Link href="/shelves" className="ui-button-secondary mt-5">
        Перейти к стеллажам
      </Link>
    </div>
  );
}

function pluralize(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
