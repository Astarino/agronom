"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Leaf, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Главная" },
  { href: "/shelves", icon: Layers, label: "Стеллажи" },
  { href: "/species", icon: Leaf, label: "Виды" },
  { href: "/notifications", icon: Bell, label: "Уведомл." },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 py-2 safe-area-inset-bottom"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
            style={{ color: active ? "var(--green-sprout)" : "var(--text-muted)" }}
          >
            <Icon style={{ width: 20, height: 20 }} />
            <span className="text-xs font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: "var(--green-sprout)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
