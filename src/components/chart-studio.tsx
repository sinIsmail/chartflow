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
import { Switch } from "@/components/ui/switch";

import { FileUpload } from "@/components/file-upload";
import { PromptDialog } from "@/components/prompt-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { AIProgressDialog } from "@/components/ai-progress-dialog";
import { ColorPicker } from "@/components/color-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChartRenderer } from "@/components/chart-renderer";
import { DataEditor } from "@/components/data-editor";
import { HistoryDialog } from "@/components/history-dialog";
import { toPng } from "html-to-image";
import { useSettings } from "@/hooks/use-settings";

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
  const [viewMode, setViewMode] = useState<"chart" | "data">("chart");
  const [savedDatasets, setSavedDatasets] = useState<Record<string, ChartData>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const { settings, updateGlobalSettings, isLoaded } = useSettings();
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleDataUpdate = (newData: ChartData) => {
    setChartData(newData);
  };

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

  const handleRawFile = (file: File) => {
    if (!settings.endpoint) {
      toast.error("AI not configured", { description: "Please configure your LLM endpoint in Settings first." });
      return;
    }
    setAiFile(file);
    setAiDialogOpen(true);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ── Presentation overlay ── */}
      {presenting && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4 sm:p-12 animate-fade-in">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:gap-3">
            <button
              onClick={handleDownload}
              aria-label="Download as Image"
              className="bg-accent text-white hover:bg-accent/90 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            <button
              onClick={() => setPresenting(false)}
              aria-label="Exit presentation mode"
              className="bg-surface hover:bg-surface-2 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors border border-border"
            >
              ✕ Exit
            </button>
          </div>
          <div ref={chartRef} className="w-full max-w-[900px] h-[400px] sm:h-[550px] p-4 sm:p-8 bg-background rounded-[32px] shadow-2xl flex flex-col">
            <h1 className="text-2xl sm:text-4xl font-heading font-black text-foreground mb-2 text-center tracking-tight">
              {enrichedData.title}
            </h1>
            {enrichedData.description && (
              <p className="text-muted-foreground text-sm sm:text-lg mb-4 sm:mb-8 text-center max-w-2xl mx-auto">
                {enrichedData.description}
              </p>
            )}
            <div className="flex-1 w-full min-h-0">
              <ChartRenderer chartType={activeChartType} data={enrichedData} colors={resolvedColors} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="flex-1 w-full h-full flex overflow-hidden relative">

        {/* Mobile Toggle Button */}
        <button 
          className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Floating Sidebar Island */}
        <aside className={`fixed inset-y-0 left-0 z-40 lg:static lg:w-[320px] flex-shrink-0 bg-surface border-r border-border p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'} w-[85%] max-w-[320px]`}>

          {/* Upload & Saved Data */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Data Source
              </span>
              <div className="flex gap-1">
                <HistoryDialog />
                <PromptDialog />
                <SettingsDialog />
              </div>
            </div>
            <FileUpload onData={handleData} onRawFile={handleRawFile} onError={handleError} />
            
            <div className="flex flex-col gap-2 mt-3 p-3 border border-border/50 rounded-lg bg-surface/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Enable OCR</span>
                <Switch checked={settings.enableOcr} onCheckedChange={(c) => updateGlobalSettings({ enableOcr: c })} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chunk Size</span>
                <select 
                  className="bg-background border border-border text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent"
                  value={settings.chunkSize}
                  onChange={(e) => updateGlobalSettings({ chunkSize: Number(e.target.value) })}
                >
                  <option value={500}>500 chars</option>
                  <option value={1000}>1000 chars</option>
                  <option value={2000}>2000 chars</option>
                  <option value={4000}>4000 chars</option>
                  <option value={8000}>8000 chars</option>
                </select>
              </div>
            </div>

            <AIProgressDialog 
              file={aiFile} 
              settings={settings} 
              open={aiDialogOpen} 
              onOpenChange={setAiDialogOpen} 
              onSuccess={handleData} 
            />
            
            {Object.keys(savedDatasets).length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saved Datasets</span>
                {Object.entries(savedDatasets).map(([id, d]) => {
                  const isActive = chartData.title === d.title;
                  return (
                    <div 
                      key={id}
                      onClick={() => setChartData(d)}
                      onMouseEnter={() => setChartData(d)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-surface-2 border-accent/50 shadow-sm' : 'bg-transparent border-border hover:bg-surface-2/50'}`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
                          {d.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {d.data.length} rows
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deleteDataset(id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        aria-label="Delete dataset"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <Separator className="opacity-50" />

          {/* Visual Chart Selector (Tree-like) */}
          <section>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Chart Topology
            </p>
            <div className="flex flex-col gap-2">
              {(Object.keys(variantsByFamily) as ChartFamily[]).map((f) => {
                const isActiveFamily = currentFamily === f;
                return (
                  <div key={f} className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        const firstVariant = variantsByFamily[f][0];
                        handleChartTypeChange(firstVariant.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-[20px] border transition-all text-left ${isActiveFamily ? 'bg-accent/10 border-accent/40 text-accent shadow-sm' : 'bg-surface/50 border-border hover:border-accent/30 text-foreground hover:bg-surface'}`}
                    >
                      <span className="font-semibold text-[13px]">
                        {FAMILY_LABELS[f]} <span className="text-[10px] text-muted-foreground ml-1">({variantsByFamily[f].length})</span>
                      </span>
                      {isActiveFamily && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                    
                    {/* Cascading Variant Grid */}
                    {isActiveFamily && (
                      <div className="grid grid-cols-2 gap-1.5 pl-2 py-1 animate-fade-in">
                        {variantsByFamily[f]?.map((v) => {
                          const isActiveVariant = chartType === v.id;
                          return (
                            <button 
                              key={v.id}
                              onClick={() => handleChartTypeChange(v.id)}
                              onMouseEnter={() => setPreviewChartType(v.id)}
                              onMouseLeave={() => setPreviewChartType(null)}
                              className={`text-left px-2.5 py-2 rounded-lg border text-[11px] font-medium transition-all ${isActiveVariant ? 'bg-accent text-white border-accent shadow-md' : 'bg-surface border-border hover:border-accent/40 text-muted-foreground hover:text-foreground'}`}
                            >
                              {v.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {activeVariant && (
              <div className="mt-3 p-3 rounded-xl bg-surface-2/50 border border-border">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {activeVariant.description}
                </p>
              </div>
            )}
          </section>

          <Separator className="opacity-50" />

          {/* Color palette */}
          <section>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Color Palette
            </p>
            <ColorPicker
              selected={palette}
              onChange={setPalette}
              customColors={customColors}
              onCustomColorChange={handleCustomColor}
              seriesCount={chartData.series.length}
            />
          </section>

          <Separator className="opacity-50" />

          {/* Theme toggle */}
          <section className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Appearance
            </span>
            <ThemeToggle />
          </section>
        </aside>

        {/* Floating Main Canvas Island */}
        <main className="flex-1 bg-background flex flex-col overflow-hidden relative">
          {/* Chart header bar */}
          <div className="px-6 sm:px-8 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/30 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-xl font-heading font-black text-foreground tracking-tight">
                {enrichedData.title}
              </h2>
              {enrichedData.description && (
                <p className="m-0 text-[13px] text-muted-foreground">
                  {enrichedData.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-surface-2 p-1 rounded-md border border-border mr-2">
                <button 
                  className={`px-3 py-1 text-xs rounded-sm transition-colors ${viewMode === "chart" ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("chart")}
                >
                  Chart
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-sm transition-colors ${viewMode === "data" ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode("data")}
                >
                  Data
                </button>
              </div>
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-2/80">
                {enrichedData.data.length} Rows
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-accent/30 text-accent bg-accent/5">
                {activeVariant?.label}
              </Badge>
              <button
                onClick={() => setPresenting(true)}
                id="present-btn"
                aria-label="Enter presentation mode"
                className="ml-2 bg-accent text-white hover:bg-accent/90 rounded-md px-4 py-1.5 text-xs sm:text-sm"
              >
                🎬 Present
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-2 sm:p-6 overflow-hidden flex flex-col animate-scale-in">
            {viewMode === "chart" ? (
              <ChartRenderer chartType={activeChartType} data={enrichedData} colors={resolvedColors} />
            ) : (
              <DataEditor data={enrichedData} onChange={handleDataUpdate} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
