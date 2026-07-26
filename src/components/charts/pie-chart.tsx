"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector,
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { ChartData } from "@/lib/schema";
import { toPieData } from "@/lib/adapters";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function PieCharts({ data, colors, variant }: Props) {
  const pieData = toPieData(data, colors);
  const config  = Object.fromEntries(
    pieData.map((d) => [d.name, { label: d.name, color: d.fill }])
  );

  const isDonut   = variant === "pie-donut";
  const isHalf    = variant === "pie-half";
  const isExploded = variant === "pie-exploded";

  const innerRadius = isDonut || isHalf ? "55%" : isExploded ? "0%" : "0%";
  const outerRadius = "75%";
  const startAngle  = isHalf ? 180 : 0;
  const endAngle    = isHalf ? 0   : 360;
  const paddingAngle = isExploded ? 4 : 1;

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <ChartContainer config={config} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy={isHalf ? "70%" : "50%"}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            paddingAngle={paddingAngle}
            animationDuration={700}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={true}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>

          {/* Donut center label */}
          {isDonut && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
              style={{ fill: "var(--text)", fontWeight: 700, fontSize: 20 }}>
              {total.toLocaleString()}
            </text>
          )}

          <Tooltip content={<ChartTooltipContent hideLabel />} />
          <Legend content={<ChartLegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
