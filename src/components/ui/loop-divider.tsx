import { cn } from "@/lib/utils";

/**
 * The Loop design system's signature section separator: three gradient
 * dots on a fading line. Used between marketing sections and long
 * coaching-transcript phases per DESIGN.md.
 */
export function LoopDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
      role="separator"
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-accent/50" />
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="size-1.5 rounded-full bg-accent/50" />
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
    </div>
  );
}
