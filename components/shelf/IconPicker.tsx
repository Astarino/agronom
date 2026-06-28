"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PlantGlyph, GLYPH_OPTIONS, isGlyphKey } from "@/components/icons/PlantGlyph";

export function IconPicker({ value, onChange }: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = isGlyphKey(value) ? value : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        <span className="flex h-5 w-5 items-center justify-center" style={{ color: active ? "var(--green-sprout)" : "var(--text-muted)" }}>
          {active ? <PlantGlyph name={active} size={18} /> : <PlantGlyph name="sprout" size={18} strokeWidth={1.3} />}
        </span>
        <span className="text-xs">{active ? GLYPH_OPTIONS.find((g) => g.key === active)?.label : "Авто"}</span>
        <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 rounded-xl p-2.5 shadow-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="mb-2 w-full rounded-lg py-1.5 text-center text-xs transition-colors hover:bg-white/[0.04]"
            style={{ color: "var(--text-muted)", border: "1px dashed var(--border)" }}>
            Авто (по виду)
          </button>
          <div className="grid grid-cols-4 gap-1.5">
            {GLYPH_OPTIONS.map((g) => {
              const selected = value === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  title={g.label}
                  onClick={() => { onChange(g.key); setOpen(false); }}
                  className="flex aspect-square items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: selected ? "var(--accent-soft)" : "var(--surface)",
                    border: selected ? "1px solid var(--accent-line)" : "1px solid transparent",
                    color: selected ? "var(--green-sprout)" : "var(--text-secondary)",
                  }}>
                  <PlantGlyph name={g.key} size={20} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
