"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function RadarCharts({ data, colors, variant }: Props) {
  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );

  const isFilled = variant === "radar-filled" || variant === "radar-multi";

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data.data} margin={{ top: 16, right: 40, left: 40, bottom: 8 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey={data.xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />

          {data.series.map((s, i) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={isFilled ? 0.25 : 0}
              strokeWidth={2}
              animationDuration={700}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
