"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

type User = { id: string; notifyBefore: number } | null;

const OPTIONS = [
  { value: 0, label: "Точно в срок", desc: "Уведомление приходит ровно в момент действия" },
  { value: 5, label: "За 5 минут", desc: "Предупреждение за 5 минут до события" },
  { value: 10, label: "За 10 минут", desc: "Предупреждение за 10 минут до события" },
];

export function NotifyTimingSettings({ user }: { user: User }) {
  const [selected, setSelected] = useState(user?.notifyBefore ?? 0);
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyBefore: selected }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3 mb-5">
        <Bell size={18} style={{ color: "#FCD34D" }} />
        <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Время уведомлений
        </h2>
      </div>

      <div className="space-y-2 mb-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
            style={{
              background: selected === opt.value ? "rgba(74,222,128,0.08)" : "var(--surface)",
              border: selected === opt.value ? "1px solid rgba(74,222,128,0.3)" : "1px solid var(--border)",
            }}>
            <div
              className="w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center"
              style={{
                borderColor: selected === opt.value ? "var(--green-sprout)" : "var(--border-light)",
                background: selected === opt.value ? "var(--green-sprout)" : "transparent",
              }}>
              {selected === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-bg" />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={save}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
        style={{ background: "rgba(74,222,128,0.1)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.3)" }}>
        {saved ? <><Check size={14} /> Сохранено</> : "Сохранить настройку"}
      </button>
    </div>
  );
}
