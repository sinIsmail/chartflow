"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { FileUpload } from "@/components/file-upload";
import { PromptDialog } from "@/components/prompt-dialog";
import { ColorPicker } from "@/components/color-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChartRenderer } from "@/components/chart-renderer";
import { toPng } from "html-to-image";

import {
  CHART_VARIANTS,
  getVariantsByFamily,
  type ChartData,
  type ChartFamily,
} from "@/lib/schema";
import { DEFAULT_SAMPLE, getSampleForFamily } from "@/lib/sample-data";
import { applyPalette, getPaletteColors, type PaletteKey } from "@/lib/palettes";

const FAMILY_LABELS: Record<ChartFamily, string> = {
  bar:      "Bar Charts",
  line:     "Line Charts",
  area:     "Area Charts",
  pie:      "Pie & Donut",
  radar:    "Radar Charts",
  radial:   "Radial Charts",
  scatter:  "Scatter & Bubble",
  composed: "Composed (Combo)",
  treemap:  "Treemap",
  funnel:   "Funnel",
};

export function ChartStudio() {
  const [chartData, setChartData] = useState<ChartData>(DEFAULT_SAMPLE);
  const [chartType, setChartType] = useState("bar-vertical");
  const [previewChartType, setPreviewChartType] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteKey>("indigo");
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [presenting, setPresenting] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState<Record<string, ChartData>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      // fontEmbedCSS: '' prevents html-to-image from scanning document.styleSheets for fonts, avoiding CORS errors in dev
      const dataUrl = await toPng(chartRef.current, { 
        cacheBust: true, 
        backgroundColor: 'var(--background)',
        fontEmbedCSS: '',
      });
      const link = document.createElement('a');
      link.download = `${enrichedData.title || 'chart'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Chart downloaded as PNG!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download chart", { description: String(err) });
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chartflow_datasets");
      if (stored) setSavedDatasets(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const saveDatasets = (datasets: Record<string, ChartData>) => {
    setSavedDatasets(datasets);
    localStorage.setItem("chartflow_datasets", JSON.stringify(datasets));
  };

  const variantsByFamily = getVariantsByFamily();
  const committedVariant = CHART_VARIANTS.find((v) => v.id === chartType)!;
  const currentFamily = committedVariant?.family ?? "bar";
  
  const activeChartType = previewChartType || chartType;
  const activeVariant = CHART_VARIANTS.find((v) => v.id === activeChartType)!;

  // When chart type changes, swap to a suitable demo if user hasn't uploaded
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
    const variant = CHART_VARIANTS.find((v) => v.id === type);
    if (variant) {
      setChartData(getSampleForFamily(variant.family));
    }
  };

  const handleData = (data: ChartData) => {
    setChartData(data);
    const id = Date.now().toString();
    const next = { ...savedDatasets, [id]: data };
    saveDatasets(next);
    toast.success(`Loaded: ${data.title}`, { description: `${data.data.length} rows · ${data.series.length} series` });
  };

  const deleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { ...savedDatasets };
    delete next[id];
    saveDatasets(next);
  };

  const handleError = (msg: string) => {
    toast.error("Upload failed", { description: msg });
  };

  const handleCustomColor = (i: number, color: string) => {
    setCustomColors((prev) => {
      const next = [...prev];
      next[i] = color;
      return next;
    });
  };

  // Resolve colors: palette or custom
  const resolvedColors =
    palette === ("custom" as PaletteKey)
      ? customColors
      : getPaletteColors(palette);

  const enrichedData: ChartData = {
    ...chartData,
    series: chartData.series.map((s, i) => ({
      ...s,
      color: resolvedColors[i % resolvedColors.length] ?? s.color ?? "#6366f1",
    })),
  };

  // Keyboard shortcut: Escape exits presentation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Presentation overlay ── */}
      {presenting && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "var(--background)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 48,
            animation: "fade-in 0.3s ease",
          }}
        >
          <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 12 }}>
            <button
              onClick={handleDownload}
              aria-label="Download as Image"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))", border: "none",
                color: "#fff", padding: "6px 14px", borderRadius: 8,
                cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PNG
            </button>
            <button
              onClick={() => setPresenting(false)}
              aria-label="Exit presentation mode"
              style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                color: "var(--text)", padding: "6px 14px", borderRadius: 8,
                cursor: "pointer", fontSize: 13,
              }}
            >
              ✕ Exit (Esc)
            </button>
          </div>
          <div ref={chartRef} style={{ width: "100%", maxWidth: 760, height: 420, padding: 32, background: "var(--background)", borderRadius: 12 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
              {enrichedData.title}
            </h1>
            {enrichedData.description && (
              <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 32, textAlign: "center" }}>
                {enrichedData.description}
              </p>
            )}
            <div style={{ width: "100%", height: "calc(100% - 80px)" }}>
              <ChartRenderer chartType={activeChartType} data={enrichedData} colors={resolvedColors} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{
          width: 280, flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          overflowY: "auto",
          padding: 16,
          display: "flex", flexDirection: "column", gap: 20,
        }}>

          {/* Upload & Saved Data */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Data Source
              </span>
              <PromptDialog />
            </div>
            <FileUpload onData={handleData} onError={handleError} />
            
            {Object.keys(savedDatasets).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Saved Datasets</span>
                {Object.entries(savedDatasets).map(([id, d]) => (
                  <div 
                    key={id}
                    onClick={() => setChartData(d)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", background: chartData.title === d.title ? "var(--surface-2)" : "transparent",
                      border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer",
                      fontSize: 13, transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = chartData.title === d.title ? "var(--surface-2)" : "transparent")}
                  >
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "180px" }}>{d.title}</span>
                    <button 
                      onClick={(e) => deleteDataset(id, e)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}
                      aria-label="Delete dataset"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Chart Family selector */}
          <section>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Chart Category
            </p>
            <Select 
              value={currentFamily} 
              onValueChange={(f: string) => {
                const firstVariant = variantsByFamily[f as ChartFamily][0];
                handleChartTypeChange(firstVariant.id);
              }}
            >
              <SelectTrigger id="chart-family-select" aria-label="Select chart category" style={{ width: "100%" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ maxHeight: 320 }}>
                {(Object.keys(variantsByFamily) as ChartFamily[]).map((f) => (
                  <SelectItem 
                    key={f} 
                    value={f}
                    onMouseEnter={() => {
                      const firstVariant = variantsByFamily[f as ChartFamily][0];
                      if (firstVariant) setPreviewChartType(firstVariant.id);
                    }}
                    onMouseLeave={() => setPreviewChartType(null)}
                  >
                    {FAMILY_LABELS[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Chart Variant selector */}
          <section style={{ marginTop: -8 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Style
            </p>
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger id="chart-type-select" aria-label="Select chart style" style={{ width: "100%" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ maxHeight: 320 }}>
                {variantsByFamily[currentFamily as ChartFamily]?.map((v) => (
                  <SelectItem 
                    key={v.id} 
                    value={v.id}
                    onMouseEnter={() => setPreviewChartType(v.id)}
                    onMouseLeave={() => setPreviewChartType(null)}
                  >
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeVariant && (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-muted)", minHeight: 32 }}>
                {activeVariant.description}
              </p>
            )}
          </section>

          <Separator />

          {/* Color palette */}
          <section>
            <ColorPicker
              selected={palette}
              onChange={setPalette}
              customColors={customColors}
              onCustomColorChange={handleCustomColor}
              seriesCount={chartData.series.length}
            />
          </section>

          <Separator />

          {/* Theme toggle */}
          <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Appearance
            </span>
            <ThemeToggle />
          </section>
        </aside>

        {/* Chart canvas */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chart header bar */}
          <div style={{
            padding: "12px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--surface)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                {enrichedData.title}
              </h2>
              {enrichedData.description && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                  {enrichedData.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge variant="secondary" style={{ fontSize: 11 }}>
                {enrichedData.data.length} rows
              </Badge>
              <Badge variant="outline" style={{ fontSize: 11 }}>
                {activeVariant?.label}
              </Badge>
              <Button
                size="sm"
                onClick={() => setPresenting(true)}
                id="present-btn"
                aria-label="Enter presentation mode"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  color: "#fff", border: "none",
                }}
              >
                🎬 Present
              </Button>
            </div>
          </div>

          {/* Chart area */}
          <div style={{ flex: 1, padding: 32, overflow: "hidden", display: "flex", flexDirection: "column" }} className="animate-fade-in">
            <ChartRenderer chartType={activeChartType} data={enrichedData} colors={resolvedColors} />
          </div>
        </main>
      </div>
    </>
  );
}
