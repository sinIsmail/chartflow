"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function AreaCharts({ data, colors, variant }: Props) {
  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );

  const isStacked  = variant === "area-stacked";
  const isStream   = variant === "area-stream";
  const isGradient = variant === "area-gradient";

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.data}
          margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
          stackOffset={isStream ? "wiggle" : undefined}
        >
          <defs>
            {data.series.map((s, i) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={colors[i % colors.length]} stopOpacity={isGradient ? 0.7 : 0.3} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={data.xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
          <Legend content={<ChartLegendContent />} />

          {data.series.map((s, i) => (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type="monotone"
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={isGradient ? `url(#grad-${s.key})` : colors[i % colors.length]}
              fillOpacity={isGradient ? 1 : 0.2}
              stackId={isStacked || isStream ? "stack" : undefined}
              animationDuration={700}
              animationBegin={i * 100}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
