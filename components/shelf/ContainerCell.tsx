"use client";

import { cn } from "@/lib/utils";
import { Droplets } from "lucide-react";
import { differenceInDays } from "date-fns";

type ContainerData = {
  id: string; position: number; stage: string; species: { name: string; color: string } | null;
  plantedAt: Date | null; lightPhaseStarted: Date | null;
};

const STAGE_STYLES: Record<string, { bg: string; border: string; glow: string; dot: string }> = {
  EMPTY:     { bg: "#0F1A11", border: "rgba(28,48,32,0.6)", glow: "none", dot: "#1F2E22" },
  PREPARATION: { bg: "#1A1535", border: "rgba(124,58,237,0.3)", glow: "0 0 12px rgba(124,58,237,0.2)", dot: "#7C3AED" },
  DARK_PHASE:  { bg: "#1C1530", border: "rgba(139,92,246,0.35)", glow: "0 0 16px rgba(139,92,246,0.25)", dot: "#8B5CF6" },
  LIGHT_PHASE: { bg: "#0F2B14", border: "rgba(74,222,128,0.3)", glow: "0 0 16px rgba(74,222,128,0.2)", dot: "#4ADE80" },
  READY:       { bg: "#2B2500", border: "rgba(252,211,77,0.5)", glow: "0 0 20px rgba(252,211,77,0.35)", dot: "#FCD34D" },
  HARVESTED:   { bg: "#0A1409", border: "rgba(28,48,32,0.3)", glow: "none", dot: "#1F2E22" },
};

const STAGE_EMOJIS: Record<string, string> = {
  EMPTY: "", PREPARATION: "🌰", DARK_PHASE: "🌑", LIGHT_PHASE: "🌱", READY: "✨", HARVESTED: "✂️",
};

export function ContainerCell({ container, onClick }: {
  container: ContainerData;
  onClick: () => void;
}) {
  const style = STAGE_STYLES[container.stage] ?? STAGE_STYLES.EMPTY;
  const days = container.plantedAt
    ? differenceInDays(new Date(), new Date(container.plantedAt))
    : null;
  const isReady = container.stage === "READY";
  const isEmpty = container.stage === "EMPTY";
  const emoji = STAGE_EMOJIS[container.stage] ?? "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all",
        "hover:scale-105 hover:brightness-110",
        isReady && "animate-pulse-slow"
      )}
      title={container.species?.name ?? "Свободно"}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: style.glow,
      }}
    >
      {/* Species color indicator */}
      {container.species && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: container.species.color }} />
      )}

      {/* Emoji / icon */}
      {!isEmpty && (
        <span className="text-base leading-none">{emoji}</span>
      )}

      {/* Day count */}
      {days !== null && !isEmpty && (
        <span className="font-mono text-[10px] leading-none"
          style={{ color: isReady ? "#FCD34D" : style.dot }}>
          д{days}
        </span>
      )}

      {/* Empty plus icon */}
      {isEmpty && (
        <span className="text-sm opacity-20" style={{ color: "var(--text-muted)" }}>+</span>
      )}

      {/* Ready pulse ring */}
      {isReady && (
        <span className="absolute inset-0 rounded-xl border border-amber-400/40 animate-ping" />
      )}
    </button>
  );
}
