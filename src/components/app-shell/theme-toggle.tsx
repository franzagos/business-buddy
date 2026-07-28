"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
] as const;

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the resolved theme is only known client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Standard SSR/client hydration-mismatch guard: flips once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (compact) {
    const currentIndex = OPTIONS.findIndex((o) => o.value === theme);
    const current = OPTIONS[currentIndex >= 0 ? currentIndex : 0];
    const CurrentIcon = current.icon;
    return (
      <button
        type="button"
        aria-label={`Tema: ${current.label}. Clicca per cambiare.`}
        title={`Tema: ${current.label}`}
        onClick={() =>
          setTheme(OPTIONS[(Math.max(currentIndex, 0) + 1) % OPTIONS.length].value)
        }
        className="flex size-9 items-center justify-center rounded-sm text-sidebar-foreground/75 outline-none transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <CurrentIcon className="size-4" />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="mx-3 flex items-center gap-1 rounded-sm bg-sidebar-accent/50 p-1"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mounted && theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-sm py-1.5 outline-none transition-colors ease-[var(--ease-snap)] duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
