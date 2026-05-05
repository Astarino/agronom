"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Layers, Leaf, Bell, Settings, Sprout, MessageCircle, ExternalLink, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-40"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}>
          <Sprout className="w-5 h-5" style={{ color: "var(--green-sprout)" }} />
        </div>
        <div>
          <div className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)", lineHeight: 1.2 }}>
            Агроном
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Дневник микрозелени</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "rgba(74,222,128,0.1)" : "transparent",
                color: active ? "var(--green-sprout)" : "var(--text-secondary)",
                border: active ? "1px solid rgba(74,222,128,0.2)" : "1px solid transparent",
              }}>
              <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Telegram bot */}
      <div className="px-3 pb-3">
        <a href="https://t.me/agronomvubot" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 w-full"
          style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>
          <MessageCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span className="flex-1">@agronomvubot</span>
          <ExternalLink style={{ width: 12, height: 12, opacity: 0.6 }} />
        </a>
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t text-xs space-y-0.5"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <div>☀️ Свет: 16 ч / 🌙 Темнота: 8 ч</div>
        <div>🌡 Температура: 20–23°C</div>
      </div>
    </aside>
  );
}
