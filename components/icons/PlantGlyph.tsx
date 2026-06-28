// Custom hand-drawn plant glyphs — replaces emoji markers.
// All glyphs are single-color (currentColor), 24×24, line-art style.

export type GlyphKey =
  | "sprout"
  | "leaf"
  | "pea"
  | "radish"
  | "sunflower"
  | "wheat"
  | "clover"
  | "scissors";

const PATHS: Record<GlyphKey, React.ReactNode> = {
  // Two leaves rising from a stem — the default microgreen mark
  sprout: (
    <>
      <path d="M12 21V10.5" />
      <path d="M12 13.5C8.4 13 6.2 10.4 6.7 6.6c3.4.6 5.4 3.2 5.3 6.9Z" />
      <path d="M12 11.5c-.1-3.7 2-6.4 5.4-7-.5 3.8-2.7 6.5-5.4 7Z" />
    </>
  ),
  // Single broad leaf with a central vein
  leaf: (
    <>
      <path d="M12 21c-6-3.4-7-11 0-17 7 6 6 13.6 0 17Z" />
      <path d="M12 21V7" />
    </>
  ),
  // Pea pod with three peas
  pea: (
    <>
      <path d="M5.5 10c3-3.6 9.5-3.6 13 0-2 3.2-11 3.2-13 0Z" />
      <circle cx="9" cy="10" r="1.15" />
      <circle cx="12" cy="10.4" r="1.15" />
      <circle cx="15" cy="10" r="1.15" />
      <path d="M18.5 9.4c1.4-.6 2-1.7 2-3.2" />
    </>
  ),
  // Radish — round bulb with leafy top
  radish: (
    <>
      <path d="M12 21.5c3.4 0 5.5-2.6 5.5-5.6S15 11 12 11s-5.5 1.9-5.5 4.9 2.1 5.6 5.5 5.6Z" />
      <path d="M12 11c-.2-2.4-1.6-4-3.9-4.6.1 2.4 1.5 4 3.9 4.6Z" />
      <path d="M12 11c.2-2.4 1.6-4 3.9-4.6-.1 2.4-1.5 4-3.9 4.6Z" />
      <path d="M12 11V8.5" />
    </>
  ),
  // Sunflower — center disc with petals
  sunflower: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9V5" />
      <path d="M12 19v-4" />
      <path d="M15 12h4" />
      <path d="M5 12h4" />
      <path d="m14.1 9.9 2.8-2.8" />
      <path d="m7.1 16.9 2.8-2.8" />
      <path d="m14.1 14.1 2.8 2.8" />
      <path d="m7.1 7.1 2.8 2.8" />
    </>
  ),
  // Wheat / grain stalk
  wheat: (
    <>
      <path d="M12 21V8" />
      <path d="M12 11c-2 .2-3.4-.8-3.6-3 2-.2 3.4.8 3.6 3Z" />
      <path d="M12 11c2 .2 3.4-.8 3.6-3-2-.2-3.4.8-3.6 3Z" />
      <path d="M12 15c-2 .2-3.4-.8-3.6-3 2-.2 3.4.8 3.6 3Z" />
      <path d="M12 15c2 .2 3.4-.8 3.6-3-2-.2-3.4.8-3.6 3Z" />
    </>
  ),
  // Three-leaf clover / general greens
  clover: (
    <>
      <path d="M12 13c-1.4-1.8-4-1.7-5.2.2-1 1.6.1 3.6 2 3.7 1.9.2 3.4-1.6 3.2-3.9Z" />
      <path d="M12 13c1.4-1.8 4-1.7 5.2.2 1 1.6-.1 3.6-2 3.7-1.9.2-3.4-1.6-3.2-3.9Z" />
      <path d="M12 13c0-2.3-1.5-4-3.4-4.2C9.8 6.9 12 7 12 9.2" opacity="0" />
      <path d="M12 13.2c-.1-2.4 1.1-4 3-4.4-.1 2.3-1.2 4-3 4.4Z" />
      <path d="M12 16.5V21" />
    </>
  ),
  // Scissors — harvested
  scissors: (
    <>
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="7" cy="17" r="2.2" />
      <path d="M8.6 8.6 19 19" />
      <path d="M8.6 15.4 19 5" />
    </>
  ),
};

export function PlantGlyph({
  name,
  size = 18,
  className,
  strokeWidth = 1.5,
  style,
}: {
  name: GlyphKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

// Selectable glyphs for the picker (scissors is auto-only, not chosen manually)
export const GLYPH_OPTIONS: { key: GlyphKey; label: string }[] = [
  { key: "sprout", label: "Росток" },
  { key: "leaf", label: "Лист" },
  { key: "pea", label: "Горох" },
  { key: "radish", label: "Редис" },
  { key: "sunflower", label: "Подсолнух" },
  { key: "wheat", label: "Злак" },
  { key: "clover", label: "Зелень" },
];

const GLYPH_KEYS = new Set<string>([
  "sprout", "leaf", "pea", "radish", "sunflower", "wheat", "clover", "scissors",
]);

export function isGlyphKey(value: string | null | undefined): value is GlyphKey {
  return !!value && GLYPH_KEYS.has(value);
}

// Pick a default glyph from a species name (keyword match).
export function glyphForSpecies(speciesName: string | undefined | null): GlyphKey {
  if (!speciesName) return "sprout";
  const name = speciesName.toLowerCase();
  if (name.includes("горох") || name.includes("pea")) return "pea";
  if (name.includes("редис") || name.includes("radish") || name.includes("дайкон")) return "radish";
  if (name.includes("подсолн") || name.includes("sunflower")) return "sunflower";
  if (name.includes("пшениц") || name.includes("злак") || name.includes("кукуруз") || name.includes("wheat") || name.includes("corn")) return "wheat";
  if (name.includes("базилик") || name.includes("руккол") || name.includes("кинз") || name.includes("basil") || name.includes("rocket") || name.includes("горчиц")) return "clover";
  if (name.includes("капуст") || name.includes("брокколи") || name.includes("cabbage") || name.includes("броккол")) return "leaf";
  return "sprout";
}
