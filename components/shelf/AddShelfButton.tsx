"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function AddShelfButton({ variant = "secondary" }: { variant?: "primary" | "secondary" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [levels, setLevels] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), levels }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setLevels(3);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
        style={
          variant === "primary"
            ? { background: "var(--green-sprout)", color: "#0A1409" }
            : { background: "rgba(74,222,128,0.1)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.3)" }
        }
      >
        <Plus size={16} />
        Добавить стеллаж
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(7,15,9,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-sprout"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Новый стеллаж
              </h2>
              <button onClick={() => setOpen(false)}
                className="p-1 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Название
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Стеллаж #2"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Количество этажей
                </label>
                <div className="flex items-center gap-3">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLevels(n)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: levels === n ? "rgba(74,222,128,0.15)" : "var(--surface)",
                        border: levels === n ? "1px solid rgba(74,222,128,0.4)" : "1px solid var(--border)",
                        color: levels === n ? "var(--green-sprout)" : "var(--text-secondary)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: "var(--green-sprout)", color: "#0A1409" }}
              >
                {loading ? "Создание..." : "Создать стеллаж"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
