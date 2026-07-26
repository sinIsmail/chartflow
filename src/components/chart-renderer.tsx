"use client";

import type { ChartData } from "@/lib/schema";
import { BarCharts }      from "@/components/charts/bar-chart";
import { LineCharts }     from "@/components/charts/line-chart";
import { AreaCharts }     from "@/components/charts/area-chart";
import { PieCharts }      from "@/components/charts/pie-chart";
import { RadarCharts }    from "@/components/charts/radar-chart";
import { RadialCharts }   from "@/components/charts/radial-chart";
import { ScatterCharts }  from "@/components/charts/scatter-chart";
import { ComposedCharts } from "@/components/charts/composed-chart";
import { TreemapChart }   from "@/components/charts/treemap-chart";
import { FunnelChart }    from "@/components/charts/funnel-chart";

interface ChartRendererProps {
  chartType: string;
  data: ChartData;
  colors: string[];
}

export function ChartRenderer({ chartType, data, colors }: ChartRendererProps) {
  const family = chartType.split("-")[0];

  const props = { data, colors, variant: chartType };

  switch (family) {
    case "bar":      return <BarCharts      {...props} />;
    case "line":     return <LineCharts     {...props} />;
    case "area":     return <AreaCharts     {...props} />;
    case "pie":      return <PieCharts      {...props} />;
    case "radar":    return <RadarCharts    {...props} />;
    case "radial":   return <RadialCharts   {...props} />;
    case "scatter":  return <ScatterCharts  {...props} />;
    case "composed": return <ComposedCharts {...props} />;
    case "treemap":  return <TreemapChart   {...props} />;
    case "funnel":   return <FunnelChart    {...props} />;
    default:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
          Unknown chart type: {chartType}
        </div>
      );
  }
}
