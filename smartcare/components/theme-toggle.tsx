"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedTheme = mounted ? theme : "system";
  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Laptop },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  return (
    <div
      className={`inline-flex h-9 items-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-1 text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}
      role="group"
      aria-label="Appearance"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const selected = selectedTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={selected}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${selected ? "bg-white text-primary shadow-sm dark:bg-slate-950" : "hover:bg-white/70 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
