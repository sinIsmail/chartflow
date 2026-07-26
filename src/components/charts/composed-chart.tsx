"use client";

import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function ComposedCharts({ data, colors, variant }: Props) {
  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );

  const isBarLine  = variant === "composed-bar-line";
  const isAreaLine = variant === "composed-area-line";

  // Role assignment: first series = bar/area, remaining = line
  const firstKey = data.series[0]?.key;
  const restKeys = data.series.slice(1);

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data.data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={data.xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left"  tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />

          {/* First series: Bar or Area */}
          {isBarLine && (
            <Bar yAxisId="left" dataKey={firstKey} name={data.series[0]?.label}
              fill={colors[0]} radius={[4, 4, 0, 0]} animationDuration={600} />
          )}
          {isAreaLine && (
            <Area yAxisId="left" type="monotone" dataKey={firstKey} name={data.series[0]?.label}
              stroke={colors[0]} fill={colors[0]} fillOpacity={0.2} strokeWidth={2} animationDuration={600} />
          )}

          {/* Remaining series: Lines on right axis */}
          {restKeys.map((s, i) => (
            <Line
              key={s.key}
              yAxisId="right"
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={colors[i + 1 < colors.length ? i + 1 : i % colors.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              animationDuration={700}
              animationBegin={(i + 1) * 100}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
