"use client";

import { useState, useEffect } from "react";
import { ChartData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { JSONValidator } from "@/lib/ai/json-validator";
import { toast } from "sonner";

interface DataEditorProps {
  data: ChartData;
  onChange: (data: ChartData) => void;
}

export function DataEditor({ data, onChange }: DataEditorProps) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync prop changes to local state
  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2));
    setError(null);
  }, [data]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validated = JSONValidator.validateChartData(parsed);
      setError(null);
      onChange(validated);
      toast.success("Data applied successfully");
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
      toast.error("Failed to parse JSON");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError("Cannot format invalid JSON");
    }
  };

  const handleDownloadJson = () => {
    try {
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "export"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error("Failed to download JSON");
    }
  };

  const handleDownloadCsv = () => {
    try {
      const parsed = JSON.parse(jsonText) as ChartData;
      if (!parsed.data || parsed.data.length === 0) {
         toast.error("No data to export");
         return;
      }
      
      const keys = Object.keys(parsed.data[0]);
      let csv = keys.join(",") + "\n";
      parsed.data.forEach(row => {
        csv += keys.map(k => {
          const val = row[k];
          if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
          return val;
        }).join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "export"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error("Failed to generate CSV. Ensure JSON is valid.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface rounded-xl border border-border">
      <div className="flex items-center justify-between p-3 border-b border-border bg-surface-2/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">JSON Data Editor</span>
          {error && <span className="text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded">{error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={handleFormat}>
            Format
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={handleDownloadCsv}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={handleDownloadJson}>
            Export JSON
          </Button>
          <Button size="sm" className="h-7 text-[10px] bg-accent text-white" onClick={handleApply}>
            Apply Changes
          </Button>
        </div>
      </div>
      <textarea
        className="flex-1 w-full p-4 font-mono text-xs bg-background text-foreground resize-none focus:outline-none custom-scrollbar"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
