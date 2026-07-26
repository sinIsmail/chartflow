"use client";

import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }} aria-hidden>☀️</span>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggle}
        id="theme-toggle"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      />
      <span style={{ fontSize: 14 }} aria-hidden>🌙</span>
    </div>
  );
}
