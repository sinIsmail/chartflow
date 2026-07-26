"use client";

import { PALETTES, type PaletteKey } from "@/lib/palettes";

interface ColorPickerProps {
  selected: PaletteKey;
  onChange: (key: PaletteKey) => void;
  customColors?: string[];
  onCustomColorChange?: (index: number, color: string) => void;
  seriesCount?: number;
}

export function ColorPicker({
  selected,
  onChange,
  customColors = [],
  onCustomColorChange,
  seriesCount = 3,
}: ColorPickerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Color Palette
      </p>

      {/* Palette grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PALETTES.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            aria-label={`Select ${p.label} palette`}
            aria-pressed={selected === p.key}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8, cursor: "pointer",
              border: selected === p.key
                ? "2px solid var(--accent)"
                : "2px solid var(--border)",
              background: selected === p.key ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "var(--surface-2)",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: p.preview,
            }} />
            <span style={{ fontSize: 12, color: "var(--text)", fontWeight: selected === p.key ? 600 : 400 }}>
              {p.label}
            </span>
          </button>
        ))}

        {/* Custom option */}
        <button
          onClick={() => onChange("custom" as PaletteKey)}
          aria-label="Select custom colors"
          aria-pressed={selected === ("custom" as PaletteKey)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 8, cursor: "pointer",
            border: selected === ("custom" as PaletteKey)
              ? "2px solid var(--accent)"
              : "2px solid var(--border)",
            background: selected === ("custom" as PaletteKey) ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "var(--surface-2)",
            transition: "all 0.15s ease",
            gridColumn: "span 2",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          }} />
          <span style={{ fontSize: 12, color: "var(--text)", fontWeight: selected === ("custom" as PaletteKey) ? 600 : 400 }}>
            Custom Colors
          </span>
        </button>
      </div>

      {/* Custom color pickers per series */}
      {selected === ("custom" as PaletteKey) && onCustomColorChange && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Pick a color per series:</p>
          {Array.from({ length: seriesCount }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="color"
                value={customColors[i] || "#6366f1"}
                onChange={(e) => onCustomColorChange(i, e.target.value)}
                aria-label={`Series ${i + 1} color`}
                style={{
                  width: 32, height: 32, border: "none", borderRadius: 6,
                  cursor: "pointer", background: "transparent", padding: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "var(--text)" }}>Series {i + 1}</span>
              <code style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                {customColors[i] || "#6366f1"}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
