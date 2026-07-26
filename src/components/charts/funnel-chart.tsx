"use client";

import { FunnelChart as RechartsFunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartData } from "@/lib/schema";
import { toFunnelData } from "@/lib/adapters";

interface Props { data: ChartData; colors: string[]; variant: string; }

export function FunnelChart({ data, colors }: Props) {
  const funnelData = toFunnelData(data, colors);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsFunnelChart>
          <Tooltip
            formatter={(v, name) => [v != null ? Number(v).toLocaleString() : "", String(name)]}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
          />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
            animationDuration={700}
          >
            <LabelList
              position="right"
              fill="var(--text)"
              stroke="none"
              dataKey="name"
              style={{ fontSize: 12, fontWeight: 600 }}
            />
            <LabelList
              position="center"
              fill="#fff"
              stroke="none"
              dataKey="value"
              formatter={(v: unknown) => v != null ? Number(v).toLocaleString() : ""}
              style={{ fontSize: 11 }}
            />
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
