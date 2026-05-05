"use client";

import { differenceInDays } from "date-fns";

type ContainerData = {
  id: string;
  position: number;
  stage: string;
  emoji: string | null;
  species: { name: string; color: string; variety: string | null } | null;
  plantedAt: Date | null;
  lightPhaseStarted: Date | null;
};

const STAGE_STYLES: Record<string, { bg: string; border: string; shadow: string }> = {
  EMPTY:       { bg: "#0C1610", border: "rgba(28,48,32,0.5)", shadow: "none" },
  PREPARATION: { bg: "#18133A", border: "rgba(124,58,237,0.35)", shadow: "0 0 14px rgba(124,58,237,0.18)" },
  DARK_PHASE:  { bg: "#1A1230", border: "rgba(139,92,246,0.4)",  shadow: "0 0 18px rgba(139,92,246,0.22)" },
  LIGHT_PHASE: { bg: "#0D2914", border: "rgba(74,222,128,0.35)", shadow: "0 0 18px rgba(74,222,128,0.18)" },
  READY:       { bg: "#2A2200", border: "rgba(252,211,77,0.55)", shadow: "0 0 22px rgba(252,211,77,0.3)"  },
  HARVESTED:   { bg: "#080F09", border: "rgba(28,48,32,0.25)",  shadow: "none" },
};

// Дефолтный emoji по виду если не задан вручную
function defaultEmoji(speciesName: string | undefined, stage: string): string {
  if (stage === "EMPTY") return "";
  if (stage === "HARVESTED") return "✂️";
  if (stage === "READY") return "🌿";
  if (!speciesName) return "🌱";

  const name = speciesName.toLowerCase();
  if (name.includes("горох") || name.includes("pea")) return "🫛";
  if (name.includes("редис") || name.includes("radish")) return "🌸";
  if (name.includes("подсолнух") || name.includes("sunflower")) return "🌻";
  if (name.includes("кукуруза") || name.includes("corn")) return "🌽";
  if (name.includes("базилик") || name.includes("basil")) return "🌿";
  if (name.includes("капуст") || name.includes("cabbage")) return "🥬";
  if (name.includes("руккол") || name.includes("rocket")) return "🍃";
  return "🌱";
}

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
  const isHarvested = container.stage === "HARVESTED";

  const emoji = container.emoji || defaultEmoji(container.species?.name, container.stage);

  return (
    <button
      onClick={onClick}
      title={container.species?.name ?? "Свободно"}
      className="relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 hover:brightness-110 focus:outline-none"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: style.shadow,
        animation: isReady ? "pulse 2s ease-in-out infinite" : undefined,
      }}
    >
      {/* Species color dot — top left */}
      {container.species && !isEmpty && (
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full"
          style={{ background: container.species.color, opacity: 0.85 }} />
      )}

      {/* Emoji */}
      {!isEmpty && !isHarvested && (
        <span className="text-sm leading-none select-none"
          style={{ filter: isReady ? "drop-shadow(0 0 4px rgba(252,211,77,0.8))" : undefined }}>
          {emoji}
        </span>
      )}

      {isHarvested && (
        <span className="text-xs leading-none select-none opacity-40">{emoji}</span>
      )}

      {/* Day counter */}
      {days !== null && !isEmpty && !isHarvested && (
        <span className="font-mono leading-none select-none"
          style={{
            fontSize: "10px",
            color: isReady ? "#FCD34D" : "rgba(255,255,255,0.35)",
          }}>
          {days}д
        </span>
      )}

      {/* Empty: plus hint */}
      {isEmpty && (
        <span style={{ fontSize: 16, opacity: 0.15, color: "var(--text-muted)" }}>+</span>
      )}

      {/* Ready pulse ring */}
      {isReady && (
        <span className="absolute inset-[-2px] rounded-xl border border-amber-400/40 animate-ping pointer-events-none" />
      )}
    </button>
  );
}
