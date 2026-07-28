"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Thin top-of-page bar giving a perceived-speed cue during client-side
 * navigations. Not a real progress tracker (App Router doesn't expose
 * fetch progress for RSC navigations) — it shows on pathname/search change,
 * runs a short CSS width transition, then fades out. Uses standard CSS
 * `transition`, so the global `prefers-reduced-motion` rule in globals.css
 * (which forces `transition-duration: 0.01ms`) applies automatically.
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [full, setFull] = useState(false);
  const firstRender = useRef(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (fullTimeout.current) clearTimeout(fullTimeout.current);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- navigation-triggered UI cue, not a render loop
    setFull(false);
    setVisible(true);

    fullTimeout.current = setTimeout(() => setFull(true), 30);
    hideTimeout.current = setTimeout(() => {
      setVisible(false);
      setFull(false);
    }, 450);

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (fullTimeout.current) clearTimeout(fullTimeout.current);
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full bg-accent transition-[width] duration-300 ease-out",
          full ? "w-full" : "w-[10%]"
        )}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
