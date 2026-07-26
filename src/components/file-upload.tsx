"use client";

import { useCallback, useRef, useState } from "react";
import { validateChartData, type ChartData } from "@/lib/schema";
import { detectFileType } from "@/lib/ai/file-detector";

interface FileUploadProps {
  onData: (data: ChartData) => void;
  onRawFile?: (file: File) => void;
  onError: (msg: string) => void;
}

export function FileUpload({ onData, onRawFile, onError }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(
    (file: File) => {
      // If it's a JSON file, check if it's already a valid ChartData object
      if (file.name.toLowerCase().endsWith(".json") || file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const raw = JSON.parse(e.target?.result as string);
            const { ok } = validateChartData(raw);
            if (ok) {
              onData(raw as ChartData); // It's ready to chart immediately
              return;
            }
            // If it's valid JSON but not a ChartData schema, send it to AI
            if (onRawFile) onRawFile(file);
          } catch {
            // Invalid JSON, send to AI (maybe it's JSON lines or broken)
            if (onRawFile) onRawFile(file);
          }
        };
        reader.readAsText(file);
        return;
      }

      // If it's any other file type, send it to the AI Processor
      const detectedType = detectFileType(file);
      if (detectedType === "unknown") {
        onError("Unsupported file format. Please upload PDF, Excel, CSV, Word, Markdown, Text, or Images.");
        return;
      }

      if (onRawFile) onRawFile(file);
    },
    [onData, onRawFile, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) process(file);
    },
    [process]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) process(file);
      e.target.value = "";
    },
    [process]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "32px 24px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging
          ? "color-mix(in srgb, var(--accent) 8%, transparent)"
          : "var(--surface-2)",
        transition: "all 0.2s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        onChange={onInputChange}
        style={{ display: "none" }}
        id="data-upload"
        aria-label="Upload data file"
      />
      <div style={{ fontSize: 32, marginBottom: 8 }}>
        {dragging ? "📂" : "✨"}
      </div>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
        {dragging ? "Drop to analyze!" : "Upload Any Data"}
      </p>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 12 }}>
        Drop CSV, PDF, Excel, Word, JSON or Images
      </p>
    </div>
  );
}
