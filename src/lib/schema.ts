// ── Universal ChartFlow JSON Schema ──
// Every chart type consumes this same format.

export interface ChartSeries {
  key: string;       // field name in data objects
  label: string;     // display name in legend/tooltip
  color?: string;    // hex color — injected by palette if omitted
  role?: "bar" | "line" | "area"; // for composed charts only
}

export interface ChartData {
  title: string;
  description?: string;
  xKey: string;      // field name used as X-axis / category label
  series: ChartSeries[];
  data: Record<string, string | number>[];
}

// ── Chart type registry ──
export type ChartFamily =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "radar"
  | "radial"
  | "scatter"
  | "composed"
  | "treemap"
  | "funnel";

export interface ChartVariant {
  id: string;
  label: string;
  family: ChartFamily;
  description: string;
}

export const CHART_VARIANTS: ChartVariant[] = [
  // Bar
  { id: "bar-vertical",   label: "Vertical Bar",    family: "bar",      description: "Standard vertical bars" },
  { id: "bar-horizontal", label: "Horizontal Bar",  family: "bar",      description: "Horizontal bar layout" },
  { id: "bar-grouped",    label: "Grouped Bar",     family: "bar",      description: "Side-by-side grouped bars" },
  { id: "bar-stacked",    label: "Stacked Bar",     family: "bar",      description: "Stacked series bars" },
  { id: "bar-100",        label: "100% Stacked Bar",family: "bar",      description: "Normalized to 100%" },
  // Line
  { id: "line-basic",     label: "Line",            family: "line",     description: "Simple line chart" },
  { id: "line-smooth",    label: "Smooth Line",     family: "line",     description: "Curved monotone line" },
  { id: "line-stepped",   label: "Stepped Line",    family: "line",     description: "Step-function line" },
  { id: "line-multi",     label: "Multi-Series Line",family: "line",    description: "Multiple data series" },
  { id: "line-dots",      label: "Dot Line",        family: "line",     description: "Line with visible data points" },
  // Area
  { id: "area-basic",     label: "Area",            family: "area",     description: "Filled area chart" },
  { id: "area-stacked",   label: "Stacked Area",    family: "area",     description: "Stacked filled areas" },
  { id: "area-gradient",  label: "Gradient Area",   family: "area",     description: "Gradient fill area" },
  { id: "area-stream",    label: "Stream Area",     family: "area",     description: "Centered stream / wiggle" },
  // Pie
  { id: "pie-basic",      label: "Pie",             family: "pie",      description: "Classic pie chart" },
  { id: "pie-donut",      label: "Donut",           family: "pie",      description: "Donut with center label" },
  { id: "pie-half",       label: "Half Donut",      family: "pie",      description: "Semicircle donut" },
  { id: "pie-exploded",   label: "Exploded Pie",    family: "pie",      description: "Separated slices" },
  // Radar
  { id: "radar-basic",    label: "Radar",           family: "radar",    description: "Spider / radar chart" },
  { id: "radar-filled",   label: "Filled Radar",    family: "radar",    description: "Filled radar polygon" },
  { id: "radar-multi",    label: "Multi Radar",     family: "radar",    description: "Multiple radar series" },
  // Radial
  { id: "radial-bar",     label: "Radial Bar",      family: "radial",   description: "Circular bar chart" },
  { id: "radial-progress",label: "Progress Ring",   family: "radial",   description: "Single progress ring" },
  // Scatter
  { id: "scatter-plot",   label: "Scatter Plot",    family: "scatter",  description: "X/Y scatter points" },
  { id: "scatter-bubble", label: "Bubble Chart",    family: "scatter",  description: "Scatter with size dimension" },
  // Composed
  { id: "composed-bar-line",  label: "Bar + Line",  family: "composed", description: "Bar and line on same chart" },
  { id: "composed-area-line", label: "Area + Line", family: "composed", description: "Area and line combo" },
  // Treemap
  { id: "treemap",        label: "Treemap",         family: "treemap",  description: "Hierarchical area blocks" },
  // Funnel
  { id: "funnel",         label: "Funnel",          family: "funnel",   description: "Conversion funnel" },
];

// Group variants by family for the dropdown
export function getVariantsByFamily(): Record<ChartFamily, ChartVariant[]> {
  const groups = {} as Record<ChartFamily, ChartVariant[]>;
  for (const v of CHART_VARIANTS) {
    if (!groups[v.family]) groups[v.family] = [];
    groups[v.family].push(v);
  }
  return groups;
}

// ── Validator ──
export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateChartData(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["Root must be a JSON object"] };
  }

  const d = raw as Record<string, unknown>;

  if (typeof d.title !== "string" || !d.title.trim())
    errors.push('"title" must be a non-empty string');

  if (typeof d.xKey !== "string" || !d.xKey.trim())
    errors.push('"xKey" must be a non-empty string');

  if (!Array.isArray(d.series) || d.series.length === 0)
    errors.push('"series" must be a non-empty array');
  else {
    (d.series as unknown[]).forEach((s, i) => {
      if (!s || typeof s !== "object") {
        errors.push(`series[${i}] must be an object`);
      } else {
        const sv = s as Record<string, unknown>;
        if (typeof sv.key !== "string")   errors.push(`series[${i}].key must be a string`);
        if (typeof sv.label !== "string") errors.push(`series[${i}].label must be a string`);
      }
    });
  }

  if (!Array.isArray(d.data) || d.data.length === 0)
    errors.push('"data" must be a non-empty array');

  return { ok: errors.length === 0, errors };
}
