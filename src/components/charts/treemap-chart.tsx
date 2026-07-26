"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartData } from "@/lib/schema";
import { toTreemapData } from "@/lib/adapters";

interface Props { data: ChartData; colors: string[]; variant: string; }

// Custom content for treemap cells
function TreemapCell(props: {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; value?: number; fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, value, fill } = props;
  if (width < 30 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill}
        rx={4} ry={4} stroke="var(--background)" strokeWidth={2} />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6}
            textAnchor="middle" fill="#fff" fontSize={Math.min(13, width / 8)} fontWeight={600}>
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10}
            textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize={Math.min(11, width / 9)}>
            {value?.toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
}

export function TreemapChart({ data, colors }: Props) {
  const nodes = toTreemapData(data, colors);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={nodes as any[]}
          dataKey="value"
          aspectRatio={4 / 3}
          content={<TreemapCell />}
          animationDuration={600}
        >
          <Tooltip
            formatter={(v, name) => [v != null ? Number(v).toLocaleString() : "", String(name)]}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
