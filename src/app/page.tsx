"use client";

import Link from "next/link";
import { ChartStudio } from "@/components/chart-studio";

export default function HomePage() {
  return (
    <div className="bg-background h-screen w-screen flex flex-col overflow-hidden">
      {/* Clean Header */}
      <header className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-sm font-bold">
            📊
          </div>
          <span className="font-heading font-black text-xl text-foreground tracking-tight">
            ChartFlow
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-accent">
            Studio
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Chart Studio Content */}
      <ChartStudio />
    </div>
  );
}
