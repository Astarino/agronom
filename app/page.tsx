export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { STAGE_LABELS, STAGE_GLOW, GrowthStage, daysSince, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Sprout, Layers, Sun, Moon, Droplets, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";

async function getDashboardData() {
  const [shelves, containers, notifications] = await Promise.all([
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
      take: 5,
      include: { container: { include: { species: true } } },
    }),
  ]);

  const stats = {
    totalShelves: shelves.length,
    totalLevels: shelves.reduce((acc, s) => acc + s.levels.length, 0),
    active: containers.filter((c) => !["HARVESTED"].includes(c.stage)).length,
    ready: containers.filter((c) => c.stage === "READY").length,
    lightPhase: containers.filter((c) => c.stage === "LIGHT_PHASE").length,
    darkPhase: containers.filter((c) => c.stage === "DARK_PHASE").length,
    harvested: containers.filter((c) => c.stage === "HARVESTED").length,
  };

  return { containers, notifications, stats };
}

const stageBadgeStyle: Record<GrowthStage, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  EMPTY:     { bg: "rgba(31,46,34,0.8)", text: "#4A6B4E", label: "Свободно", icon: null },
  PREPARATION: { bg: "rgba(26,21,53,0.8)", text: "#A78BFA", label: "Подготовка", icon: <Sprout size={12}/> },
  DARK_PHASE:  { bg: "rgba(28,21,48,0.8)", text: "#C4B5FD", label: "Тёмная фаза", icon: <Moon size={12}/> },
  LIGHT_PHASE: { bg: "rgba(15,43,20,0.8)", text: "#4ADE80", label: "Под светом", icon: <Sun size={12}/> },
  READY:       { bg: "rgba(43,37,0,0.9)", text: "#FCD34D", label: "Готово!", icon: <CheckCircle2 size={12}/> },
  HARVESTED:   { bg: "rgba(10,20,9,0.8)", text: "#4A6B4E", label: "Собрано", icon: null },
};

export default async function DashboardPage() {
  const { containers, notifications, stats } = await getDashboardData();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Дашборд
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger">
        <StatCard icon={<Sprout size={18} />} label="Активных" value={stats.active} color="var(--green-sprout)" />
        <StatCard icon={<Sun size={18} />} label="Под светом" value={stats.lightPhase} color="#FCD34D" />
        <StatCard icon={<Moon size={18} />} label="Тёмная фаза" value={stats.darkPhase} color="#A78BFA" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Готово к сбору" value={stats.ready} color="#F97316" urgent={stats.ready > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active containers */}
        <div className="lg:col-span-2">
          <SectionTitle icon={<Sprout size={16} />}>Активные посевы</SectionTitle>
          {containers.length === 0 ? (
            <EmptyState
              message="Нет активных контейнеров"
              hint="Перейдите на стеллаж и начните посев"
              href="/shelves"
            />
          ) : (
            <div className="space-y-2">
              {containers.slice(0, 8).map((c) => {
                const stage = c.stage as GrowthStage;
                const badge = stageBadgeStyle[stage];
                const days = c.plantedAt ? daysSince(c.plantedAt) : 0;
                const shelfName = c.tray.level.shelf.name;
                const levelNum = c.tray.level.levelNumber;
                const glow = STAGE_GLOW[stage];

                return (
                  <Link
                    key={c.id}
                    href={`/containers/${c.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      boxShadow: glow !== "transparent" ? `0 0 0 1px ${glow}22` : undefined,
                    }}
                  >
                    {/* Species color dot */}
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: c.species?.color ?? "#4A6B4E" }} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {c.species?.name ?? "Не назначен"}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1"
                          style={{ background: badge.bg, color: badge.text }}>
                          {badge.icon}
                          {badge.label}
                        </span>
                        {stage === "READY" && (
                          <span className="text-xs animate-pulse" style={{ color: "#F97316" }}>⚠️</span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {shelfName} / Этаж {levelNum} · День {days}
                      </div>
                    </div>

                    {/* Days badge */}
                    <div className="font-mono text-xs px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                      д.{days}
                    </div>
                  </Link>
                );
              })}
              {containers.length > 8 && (
                <Link href="/shelves" className="block text-center text-sm py-2 rounded-xl transition-colors"
                  style={{ color: "var(--green-sprout)", background: "rgba(74,222,128,0.05)" }}>
                  Показать ещё {containers.length - 8} →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming notifications */}
          <div>
            <SectionTitle icon={<Clock size={16} />}>Ближайшие задачи</SectionTitle>
            {notifications.length === 0 ? (
              <div className="rounded-xl p-4 text-sm text-center"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                Нет запланированных задач
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="text-sm font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {n.message.split("\n")[0]}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(n.scheduledAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <SectionTitle icon={<Layers size={16} />}>Быстрый доступ</SectionTitle>
            <div className="space-y-2">
              <QuickLink href="/shelves" label="Мои стеллажи" sub={`${stats.totalShelves} стеллажей · ${stats.totalLevels} этажей`} />
              <QuickLink href="/species" label="Виды растений" sub="3 вида доступно" />
              <QuickLink href="/settings" label="Telegram бот" sub="Настроить уведомления" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, urgent }: {
  icon: React.ReactNode; label: string; value: number; color: string; urgent?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl animate-fade-in ${urgent && value > 0 ? "animate-pulse-slow" : ""}`}
      style={{
        background: "var(--card)",
        border: urgent && value > 0 ? `1px solid ${color}55` : "1px solid var(--border)",
        boxShadow: urgent && value > 0 ? `0 0 20px ${color}22` : undefined,
      }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color }}>{icon}</span>
        {urgent && value > 0 && <AlertTriangle size={14} style={{ color: "#F97316" }} />}
      </div>
      <div className="font-mono text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-3"
      style={{ color: "var(--text-muted)" }}>
      {icon}<span>{children}</span>
    </h2>
  );
}

function QuickLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href}
      className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
      </div>
      <span style={{ color: "var(--text-muted)" }}>→</span>
    </Link>
  );
}

function EmptyState({ message, hint, href }: { message: string; hint: string; href: string }) {
  return (
    <Link href={href}
      className="flex flex-col items-center justify-center p-8 rounded-xl text-center transition-all hover:scale-[1.01]"
      style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
      <Sprout size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
      <div className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{message}</div>
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>{hint}</div>
    </Link>
  );
}
