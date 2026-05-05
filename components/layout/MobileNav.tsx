"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Leaf, Archive, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Главная" },
  { href: "/shelves", icon: Layers, label: "Стеллажи" },
  { href: "/species", icon: Leaf, label: "Виды" },
  { href: "/history", icon: Archive, label: "История" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-1 py-2"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
            style={{ color: active ? "var(--green-sprout)" : "var(--text-muted)" }}>
            <Icon style={{ width: 20, height: 20 }} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
