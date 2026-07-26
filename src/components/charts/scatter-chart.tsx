"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ZAxis, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";
import { toScatterData } from "@/lib/adapters";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function ScatterCharts({ data, colors, variant }: Props) {
  const isBubble = variant === "scatter-bubble";
  const points   = toScatterData(data);

  const config = {
    scatter: { label: data.series[0]?.label ?? "Value", color: colors[0] },
  };

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="x" type="number" name={data.xKey}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: data.xKey, position: "insideBottom", offset: -4, fill: "var(--text-muted)", fontSize: 11 }}
          />
          <YAxis
            dataKey="y" type="number" name={data.series[0]?.label}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
          />
          {isBubble && (
            <ZAxis dataKey="z" range={[40, 400]} name={data.series[1]?.label ?? "Size"} />
          )}
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<ChartTooltipContent />}
          />
          <Scatter
            name={data.series[0]?.label ?? "Data"}
            data={points}
            fill={colors[0]}
            fillOpacity={isBubble ? 0.6 : 0.85}
            animationDuration={600}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
