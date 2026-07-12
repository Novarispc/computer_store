"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { MODE_STORAGE_KEY } from "@/lib/constants";

type Mode = "light" | "dark";

export function ModeToggle({ className }: { className?: string }) {
  // Start undefined so SSR and first client render agree; ThemeInit has already
  // applied the real mode to <html>, so there is nothing to flash.
  const [mode, setMode] = useState<Mode | undefined>(undefined);

  useEffect(() => {
    setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Mode = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {}
    setMode(next);
  }

  const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={className}
      suppressHydrationWarning
    >
      {mode === "dark" ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
    </button>
  );
}
