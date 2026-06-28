"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Leaf, Archive, Bell } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Главная" },
  { href: "/shelves", icon: Layers, label: "Стеллажи" },
  { href: "/species", icon: Leaf, label: "Виды" },
  { href: "/history", icon: Archive, label: "История" },
  { href: "/notifications", icon: Bell, label: "Задачи" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass safe-bottom fixed inset-x-0 bottom-0 z-50 flex items-center justify-around px-1 pt-2 lg:hidden"
      style={{ borderWidth: "1px 0 0" }} aria-label="Мобильная навигация">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className="relative flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors"
            style={{
              color: active ? "var(--green-sprout)" : "var(--text-muted)",
              background: active ? "rgba(135, 189, 156,0.08)" : "transparent",
            }}>
            <Icon size={19} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
