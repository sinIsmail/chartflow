"use client";

import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
  PolarAngleAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function RadialCharts({ data, colors, variant }: Props) {
  const isProgress = variant === "radial-progress";

  // Progress ring: use first series of first row only
  if (isProgress) {
    const s = data.series[0];
    const value = Number(data.data[0]?.[s.key] ?? 0);
    const max   = 100;
    const pct   = Math.min((value / max) * 100, 100);

    return (
      <div style={{ width: "100%", height: "100%", minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 240, height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="90%"
              data={[{ name: s.label, value: pct, fill: colors[0] }]}
              startAngle={90} endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--border)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "var(--text)" }}>{Math.round(pct)}%</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        </div>
      </div>
    );
  }

  // Radial bar — one bar per series using first data row
  const radialData = data.series.map((s, i) => ({
    name: s.label,
    value: Number(data.data[0]?.[s.key] ?? 0),
    fill: colors[i % colors.length],
  }));

  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="20%" outerRadius="80%"
          data={radialData}
          startAngle={90} endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, Math.max(...radialData.map((d) => d.value)) * 1.2]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--border)" }} label={{ position: "insideStart", fill: "var(--text)", fontSize: 11 }} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
