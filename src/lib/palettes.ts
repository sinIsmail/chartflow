// ── Color palettes for chart series ──
// Each palette has 6 colors: enough for 6 data series.

export type PaletteKey =
  | "indigo"
  | "sunset"
  | "ocean"
  | "forest"
  | "candy"
  | "mono";

export interface Palette {
  key: PaletteKey;
  label: string;
  colors: string[];
  preview: string; // gradient CSS for the swatch
}

export const PALETTES: Palette[] = [
  {
    key: "indigo",
    label: "Indigo Storm",
    colors: ["#6366f1", "#8b5cf6", "#06b6d4", "#3b82f6", "#a855f7", "#14b8a6"],
    preview: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
  },
  {
    key: "sunset",
    label: "Sunset",
    colors: ["#f97316", "#ef4444", "#eab308", "#f43f5e", "#fb923c", "#fde047"],
    preview: "linear-gradient(135deg, #f97316, #ef4444, #eab308)",
  },
  {
    key: "ocean",
    label: "Ocean",
    colors: ["#06b6d4", "#0ea5e9", "#14b8a6", "#22d3ee", "#38bdf8", "#2dd4bf"],
    preview: "linear-gradient(135deg, #06b6d4, #0ea5e9, #14b8a6)",
  },
  {
    key: "forest",
    label: "Forest",
    colors: ["#22c55e", "#16a34a", "#84cc16", "#4ade80", "#65a30d", "#a3e635"],
    preview: "linear-gradient(135deg, #22c55e, #16a34a, #84cc16)",
  },
  {
    key: "candy",
    label: "Candy",
    colors: ["#f472b6", "#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f9a8d4"],
    preview: "linear-gradient(135deg, #f472b6, #a78bfa, #34d399)",
  },
  {
    key: "mono",
    label: "Monochrome",
    colors: ["#f1f5f9", "#94a3b8", "#64748b", "#334155", "#1e293b", "#0f172a"],
    preview: "linear-gradient(135deg, #f1f5f9, #64748b, #1e293b)",
  },
];

export const DEFAULT_PALETTE: PaletteKey = "indigo";

/** Apply a palette's colors to a list of series (returns new array, no mutation) */
export function applyPalette(
  series: Array<{ key: string; label: string; color?: string }>,
  paletteKey: PaletteKey
): Array<{ key: string; label: string; color: string }> {
  const palette = PALETTES.find((p) => p.key === paletteKey)!;
  return series.map((s, i) => ({
    ...s,
    color: s.color || palette.colors[i % palette.colors.length],
  }));
}

/** Get colors array for a palette key */
export function getPaletteColors(key: PaletteKey): string[] {
  return PALETTES.find((p) => p.key === key)?.colors ?? PALETTES[0].colors;
}
