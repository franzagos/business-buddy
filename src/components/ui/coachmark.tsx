"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function storageKey(id: string) {
  return `bb-coachmark-seen:${id}`;
}

/**
 * Returns whether the coach mark with `id` should be shown, and a function
 * to mark it as seen (persisted in localStorage, never shown again).
 * Starts as `false` on the server / first render to avoid hydration
 * mismatches, then flips to `true` on mount if not seen yet.
 */
export function useCoachmark(id: string) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reads from localStorage (an external system) once on mount to decide
    // whether this coach mark has already been dismissed.
    try {
      if (!window.localStorage.getItem(storageKey(id))) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage), not a cascading render loop
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — just skip the coach mark.
    }
  }, [id]);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(storageKey(id), "1");
    } catch {
      // ignore
    }
  }

  return { visible, dismiss };
}

interface CoachmarkProps {
  title: string;
  description: string;
  onDismiss: () => void;
  className?: string;
}

/** Short, first-use-only callout. Anchor it with a `relative` wrapper on the caller's side. */
export function Coachmark({
  title,
  description,
  onDismiss,
  className,
}: CoachmarkProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 ease-[var(--ease-settle)] z-40 w-72 rounded-md border border-primary/20 bg-popover p-4 text-popover-foreground shadow-[var(--shadow-1,0_4px_16px_rgba(19,33,90,0.14))]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Chiudi suggerimento"
          className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        Ho capito
      </button>
    </div>
  );
}
