"use client";

import { useCallback, useRef, useState } from "react";
import { validateChartData, type ChartData } from "@/lib/schema";

interface FileUploadProps {
  onData: (data: ChartData) => void;
  onError: (msg: string) => void;
}

export function FileUpload({ onData, onError }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".json")) {
        onError("Please upload a .json file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(e.target?.result as string);
          const { ok, errors } = validateChartData(raw);
          if (!ok) {
            onError("Invalid JSON format:\n" + errors.join("\n"));
            return;
          }
          onData(raw as ChartData);
        } catch {
          onError("Could not parse JSON file — check for syntax errors");
        }
      };
      reader.readAsText(file);
    },
    [onData, onError]
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
        accept=".json"
        onChange={onInputChange}
        style={{ display: "none" }}
        id="json-upload"
        aria-label="Upload JSON file"
      />
      <div style={{ fontSize: 32, marginBottom: 8 }}>
        {dragging ? "📂" : "📁"}
      </div>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
        {dragging ? "Drop it!" : "Upload JSON File"}
      </p>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 12 }}>
        Drag & drop or click to browse
      </p>
    </div>
  );
}
