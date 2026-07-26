"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ChartData } from "@/lib/schema";

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Record<string, ChartData>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chartflow_datasets");
      if (stored) setDatasets(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const deleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { ...datasets };
    delete next[id];
    setDatasets(next);
    localStorage.setItem("chartflow_datasets", JSON.stringify(next));
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center bg-background">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-surface border border-border rounded-[32px] px-6 py-3 flex items-center justify-between gap-8 shadow-sm animate-fade-in w-[95%] max-w-4xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[14px] bg-accent flex items-center justify-center text-lg text-white group-hover:scale-105 transition-transform">
            📊
          </div>
          <span className="font-heading font-black text-2xl text-foreground tracking-tight">
            ChartFlow
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            Studio
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-accent hover:text-accent-2 transition-colors">
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-6xl px-6 pt-32 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-3">
              Personal Files
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl">
              Manage your saved datasets and generated charts. All data is securely stored in your browser's local storage.
            </p>
          </div>
        </div>

        {Object.keys(datasets).length === 0 ? (
          <div className="bg-surface border border-border rounded-xl w-full p-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center text-4xl mb-6">
              📂
            </div>
            <h3 className="text-2xl font-bold font-heading mb-2">No files yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              You haven't saved any datasets yet. Head over to the Studio, upload some data, and it will appear here.
            </p>
            <Link href="/" className="bg-accent text-white rounded-md px-8 py-4 inline-flex items-center justify-center font-bold hover:bg-accent/90 transition-colors">
              Go to Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(datasets).map(([id, d], index) => (
              <div 
                key={id}
                className="bg-surface border border-border rounded-xl p-6 flex flex-col h-64 hover:-translate-y-1 hover:shadow-md transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-heading line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {d.description || "No description provided."}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rows</span>
                    <span className="text-lg font-black font-heading text-foreground">{d.data?.length || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => deleteDataset(id, e)}
                      className="w-10 h-10 rounded-md bg-surface-2 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors border border-transparent hover:border-destructive"
                      aria-label="Delete dataset"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                    <Link 
                      href="/"
                      className="w-10 h-10 rounded-md bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors"
                      aria-label="Open in Studio"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
