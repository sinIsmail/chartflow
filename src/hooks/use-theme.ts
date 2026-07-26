"use client";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("cf-theme") as Theme) || "dark";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("cf-theme", next);
    applyTheme(next);
  }

  return { theme, toggle };
}

function applyTheme(t: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(t);
}
