"use client";

import { differenceInDays } from "date-fns";
import { Check } from "lucide-react";
import { PlantGlyph, glyphForSpecies, isGlyphKey, type GlyphKey } from "@/components/icons/PlantGlyph";

type ContainerData = {
  id: string;
  position: number;
  stage: string;
  emoji: string | null;
  species: { name: string; color: string; variety: string | null } | null;
  plantedAt: Date | null;
  lightPhaseStarted: Date | null;
};

const STAGE_STYLES: Record<string, { bg: string; border: string; shadow: string; ink: string }> = {
  EMPTY:       { bg: "#1a1c18", border: "rgba(58,60,54,.7)",     shadow: "none", ink: "var(--text-muted)" },
  PREPARATION: { bg: "#232136", border: "rgba(163, 158, 192,.3)", shadow: "none", ink: "#bdb8d6" },
  DARK_PHASE:  { bg: "#242137", border: "rgba(170, 164, 196,.32)", shadow: "none", ink: "#c6c1dc" },
  LIGHT_PHASE: { bg: "#1c2c22", border: "rgba(135, 189, 156,.3)",  shadow: "none", ink: "#9bcfae" },
  READY:       { bg: "#2a2618", border: "rgba(212, 184, 120,.45)", shadow: "0 0 0 1px rgba(212, 184, 120,.08)", ink: "#e0c98a" },
  HARVESTED:   { bg: "#181a16", border: "rgba(58,60,54,.4)",      shadow: "none", ink: "var(--text-muted)" },
};

// Default glyph for a container's marker (manual override stored as a glyph key).
function resolveGlyph(emoji: string | null, speciesName: string | undefined, stage: string): GlyphKey {
  if (stage === "HARVESTED") return "scissors";
  if (isGlyphKey(emoji)) return emoji;
  return glyphForSpecies(speciesName);
}

export function ContainerCell({ container, onClick, selectionMode = false, selected = false }: {
  container: ContainerData;
  onClick: () => void;
  selectionMode?: boolean;
  selected?: boolean;
}) {
  const style = STAGE_STYLES[container.stage] ?? STAGE_STYLES.EMPTY;
  const days = container.plantedAt
    ? differenceInDays(new Date(), new Date(container.plantedAt))
    : null;

  const isReady = container.stage === "READY";
  const isEmpty = container.stage === "EMPTY";
  const isHarvested = container.stage === "HARVESTED";

  const glyph = resolveGlyph(container.emoji, container.species?.name, container.stage);

  return (
    <button
      onClick={onClick}
      title={selectionMode && !isEmpty ? "Занятый контейнер нельзя выбрать" : container.species?.name ?? "Свободно"}
      aria-label={selectionMode
        ? `${selected ? "Убрать из выбора" : "Выбрать"} свободный контейнер ${container.position}`
        : `${container.species?.name ?? "Свободный контейнер"}, позиция ${container.position}`}
      aria-pressed={selectionMode ? selected : undefined}
      disabled={selectionMode && !isEmpty}
      data-testid={`container-cell-${container.id}`}
      data-container-id={container.id}
      data-container-selected={selected ? "true" : "false"}
      className="relative aspect-square min-h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:-translate-y-0.5 hover:brightness-110 focus:outline-none motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
      style={{
        background: selected ? "rgba(135, 189, 156,.16)" : style.bg,
        border: selected ? "2px solid var(--green-sprout)" : `1px solid ${style.border}`,
        boxShadow: selected ? "0 0 0 3px rgba(135, 189, 156,.1)" : style.shadow,
      }}
    >
      {/* Species color dot — top left */}
      {container.species && !isEmpty && (
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full"
          style={{ background: container.species.color, opacity: 0.85 }} />
      )}

      {/* Plant glyph */}
      {!isEmpty && !isHarvested && (
        <span className="leading-none" style={{ color: style.ink }}>
          <PlantGlyph name={glyph} size={18} strokeWidth={1.5} />
        </span>
      )}

      {isHarvested && (
        <span className="leading-none opacity-35" style={{ color: style.ink }}>
          <PlantGlyph name={glyph} size={15} strokeWidth={1.5} />
        </span>
      )}

      {/* Day counter */}
      {days !== null && !isEmpty && !isHarvested && (
        <span className="font-mono leading-none select-none"
          style={{
            fontSize: "10px",
            color: isReady ? "#e0c98a" : "rgba(255,255,255,0.35)",
          }}>
          {days}д
        </span>
      )}

      {/* Empty: plus hint */}
      {isEmpty && (
        selected ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "var(--green-sprout)", color: "#08110b" }}>
            <Check size={14} strokeWidth={3} />
          </span>
        ) : (
          <span style={{ fontSize: 16, opacity: selectionMode ? 0.55 : 0.15, color: "var(--text-muted)" }}>
            {selectionMode ? "○" : "+"}
          </span>
        )
      )}

      {isReady && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#d9c08a]" />
      )}
    </button>
  );
}
