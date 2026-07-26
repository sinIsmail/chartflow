"use client";

import { ChartStudio } from "@/components/chart-studio";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>📊</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>
            ChartFlow
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            padding: "2px 8px", borderRadius: 20,
          }}>BETA</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>
          Upload JSON → Select Chart → Visualize instantly
        </p>
      </header>

      {/* Chart Studio */}
      <ChartStudio />
    </div>
  );
}
