"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";

interface Props { data: ChartData; colors: string[]; variant: string; }

function curveType(variant: string): "linear" | "monotone" | "step" {
  if (variant === "line-smooth" || variant === "line-multi") return "monotone";
  if (variant === "line-stepped") return "step";
  return "linear";
}

export function LineCharts({ data, colors, variant }: Props) {
  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );

  const showDots = variant === "line-dots";
  const curve    = curveType(variant);

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={data.xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
          <Legend content={<ChartLegendContent />} />

          {data.series.map((s, i) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type={curve}
              stroke={colors[i % colors.length]}
              strokeWidth={2.5}
              dot={showDots ? { r: 4, fill: colors[i % colors.length], strokeWidth: 0 } : false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={700}
              animationBegin={i * 100}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
