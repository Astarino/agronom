"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJI_GROUPS = [
  { label: "Зелень", emojis: ["🌱", "🌿", "🍀", "🍃", "🌾", "🎋", "🪴"] },
  { label: "Овощи", emojis: ["🥬", "🥦", "🥕", "🌽", "🫛", "🥒", "🧅", "🧄"] },
  { label: "Цветы", emojis: ["🌸", "🌺", "🌼", "🌻", "🌹", "🌷"] },
  { label: "Природа", emojis: ["🍄", "🌰", "🌊", "💧", "☀️", "🌙", "⭐"] },
  { label: "Прочее", emojis: ["✂️", "📦", "🧪", "🌡️", "⚗️", "🔬", "📋"] },
];

export function EmojiPicker({ value, onChange }: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <span className="text-lg w-6 text-center">{value || "😶"}</span>
        <Smile size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-xl p-3 shadow-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {/* Clear */}
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-xs text-center py-1.5 rounded-lg mb-2 transition-colors hover:bg-white/5"
            style={{ color: "var(--text-muted)", border: "1px dashed var(--border)" }}>
            Авто (по виду)
          </button>

          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{group.label}</p>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { onChange(e); setOpen(false); }}
                    className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: value === e ? "rgba(74,222,128,0.15)" : "var(--surface)",
                      border: value === e ? "1px solid rgba(74,222,128,0.4)" : "1px solid transparent",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
