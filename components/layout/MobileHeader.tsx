"use client";

import Link from "next/link";
import { Bell, Settings, Sprout } from "lucide-react";

export function MobileHeader() {
  return (
    <header
      className="glass sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden"
      style={{ borderWidth: "0 0 1px" }}
    >
      <Link href="/" className="flex items-center gap-2.5" aria-label="Агроном — главная">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: "rgba(135, 189, 156,0.12)", color: "var(--green-sprout)" }}
        >
          <Sprout size={18} />
        </span>
        <span className="font-display text-base font-bold">Агроном</span>
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="ui-icon-button h-9 w-9" aria-label="Уведомления">
          <Bell size={16} />
        </Link>
        <Link href="/settings" className="ui-icon-button h-9 w-9" aria-label="Настройки">
          <Settings size={16} />
        </Link>
      </div>
    </header>
  );
}
