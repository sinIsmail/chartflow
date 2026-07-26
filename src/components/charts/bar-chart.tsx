"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LabelList, Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";
import { to100StackedData } from "@/lib/adapters";

interface Props { data: ChartData; colors: string[]; variant: string; }

function makeConfig(data: ChartData, colors: string[]) {
  return Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: colors[i % colors.length] }])
  );
}

export function BarCharts({ data, colors, variant }: Props) {
  const config = makeConfig(data, colors);
  const seriesKeys = data.series.map((s) => s.key);

  const chartData = variant === "bar-100"
    ? to100StackedData(data.data, seriesKeys)
    : data.data;

  const isHorizontal = variant === "bar-horizontal";
  const is100        = variant === "bar-100";
  const isStacked    = variant === "bar-stacked" || is100;
  const isGrouped    = variant === "bar-grouped";
  const pctFormatter = (v: number | string) => `${v}%`;

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
          barCategoryGap="20%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={!isHorizontal} horizontal={isHorizontal} />
          {isHorizontal ? (
            <>
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={is100 ? pctFormatter : undefined}
              />
              <YAxis dataKey={data.xKey} type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={data.xKey} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={is100 ? pctFormatter : undefined}
              />
            </>
          )}
          <Tooltip
            content={<ChartTooltipContent
              formatter={is100 ? (v) => [`${v}%`] : undefined}
            />}
            cursor={{ fill: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
          />
          <Legend content={<ChartLegendContent />} />

          {data.series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={colors[i % colors.length]}
              stackId={isStacked ? "stack" : undefined}
              radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              animationDuration={600}
              animationBegin={i * 80}
            >
              {/* For single-series vertical bar, color each bar differently */}
              {!isStacked && !isGrouped && data.series.length === 1 &&
                chartData.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))
              }
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
