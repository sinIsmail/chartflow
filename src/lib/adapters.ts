import type { ChartData } from "./schema";

// ── Adapter: normalize stacked bar data to 100% ──
export function to100StackedData(
  data: ChartData["data"],
  seriesKeys: string[]
): Record<string, string | number>[] {
  return data.map((row) => {
    const total = seriesKeys.reduce((sum, k) => sum + Number(row[k] ?? 0), 0);
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = seriesKeys.includes(k) && total > 0
        ? Math.round((Number(v) / total) * 100)
        : v;
    }
    return out;
  });
}

// ── Adapter: Scatter / Bubble ──
// Maps first series key to Y, xKey to X, optional third series to Z (bubble radius)
export interface ScatterPoint {
  x: number | string;
  y: number;
  z?: number;
  label?: string;
}

export function toScatterData(chart: ChartData): ScatterPoint[] {
  const yKey = chart.series[0]?.key;
  const zKey = chart.series[1]?.key;
  return chart.data.map((row) => ({
    x: row[chart.xKey],
    y: Number(row[yKey] ?? 0),
    ...(zKey ? { z: Number(row[zKey] ?? 10) } : {}),
    label: String(row[chart.xKey]),
  }));
}

// ── Adapter: Treemap ──
export interface TreemapNode {
  name: string;
  value: number;
  fill?: string;
}

export function toTreemapData(chart: ChartData, colors: string[]): TreemapNode[] {
  const valKey = chart.series[0]?.key;
  return chart.data.map((row, i) => ({
    name: row[chart.xKey] ? String(row[chart.xKey]) : `Item ${i + 1}`,
    value: Number(row[valKey] ?? 0),
    fill: colors[i % colors.length],
  }));
}

// ── Adapter: Funnel ──
export interface FunnelEntry {
  name: string;
  value: number;
  fill: string;
}

export function toFunnelData(chart: ChartData, colors: string[]): FunnelEntry[] {
  const valKey = chart.series[0]?.key;
  return chart.data.map((row, i) => ({
    name: String(row[chart.xKey]),
    value: Number(row[valKey] ?? 0),
    fill: colors[i % colors.length],
  }));
}

// ── Adapter: Pie / Donut ──
export interface PieEntry {
  name: string;
  value: number;
  fill: string;
}

export function toPieData(chart: ChartData, colors: string[]): PieEntry[] {
  const valKey = chart.series[0]?.key;
  return chart.data.map((row, i) => ({
    name: String(row[chart.xKey]),
    value: Number(row[valKey] ?? 0),
    fill: colors[i % colors.length],
  }));
}
