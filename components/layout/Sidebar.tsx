"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Leaf,
  Bell,
  Settings,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/shelves", icon: Layers, label: "Стеллажи" },
  { href: "/species", icon: Leaf, label: "Виды" },
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
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}>
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
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "text-[var(--green-sprout)]"
                  : "hover:text-[var(--text-primary)]"
              )}
              style={{
                background: active ? "rgba(74,222,128,0.1)" : "transparent",
                color: active ? "var(--green-sprout)" : "var(--text-secondary)",
                border: active ? "1px solid rgba(74,222,128,0.2)" : "1px solid transparent",
              }}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <div>Свет: 16ч вкл / 8ч выкл</div>
        <div className="mt-1">Темп: 20–23°C</div>
      </div>
    </aside>
  );
}
