"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Layers, Leaf, Bell, Settings, Sprout, MessageCircle, ExternalLink, Archive,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/shelves", icon: Layers, label: "Стеллажи" },
  { href: "/species", icon: Leaf, label: "Виды" },
  { href: "/history", icon: Archive, label: "История" },
  { href: "/notifications", icon: Bell, label: "Уведомления" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r lg:flex"
      style={{ background: "rgba(13,23,17,0.92)", borderColor: "var(--border)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(135, 189, 156,0.12)", color: "var(--green-sprout)" }}>
          <Sprout size={20} />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            Агроном
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>Микрозелень под контролем</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Основная навигация">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: active ? "rgba(135, 189, 156,0.1)" : "transparent",
                color: active ? "var(--green-sprout)" : "var(--text-secondary)",
              }}>
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full" style={{ background: "var(--green-sprout)" }} />}
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="mb-3 px-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
            Режим выращивания
          </div>
          <div className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
            Свет 16 ч · Темнота 8 ч<br />Температура 20–23°C
          </div>
        </div>
        <a href="https://t.me/agronomvubot" target="_blank" rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ background: "var(--surface-raised)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          <MessageCircle size={16} />
          <span className="flex-1">@agronomvubot</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
}
