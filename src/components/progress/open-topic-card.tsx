"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OpenTopicCardProps {
  id: string;
  coachId: string;
  topic: string;
  reason: string | null;
  howToTest: string | null;
  sessionId: string | null;
  status: "open" | "closed";
  competenceRating: number | null;
}

export function OpenTopicCard({
  id,
  coachId,
  topic,
  reason,
  howToTest,
  sessionId,
  status,
  competenceRating,
}: OpenTopicCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [rating, setRating] = useState(competenceRating);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/open-topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("failed");
    return res.json();
  }

  async function handleToggleStatus() {
    setSavingStatus(true);
    const nextStatus = status === "open" ? "closed" : "open";
    try {
      await patch({ status: nextStatus });
      router.refresh();
    } catch {
      toast.error("Non sono riuscito ad aggiornare il tema. Riprova.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleRate(value: number) {
    const next = rating === value ? null : value; // click again to clear
    setRating(next);
    setSavingRating(true);
    try {
      await patch({ competenceRating: next });
    } catch {
      toast.error("Non sono riuscito a salvare la valutazione. Riprova.");
      setRating(competenceRating);
    } finally {
      setSavingRating(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
      >
        <div className="min-w-0 space-y-0.5">
          <p
            className={cn(
              "truncate text-sm font-medium",
              status === "closed"
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {topic}
          </p>
          {reason && (
            <p className="truncate text-xs text-muted-foreground">{reason}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {rating !== null ? (
            <span className="font-mono text-xs text-muted-foreground">
              {rating}/10
            </span>
          ) : (
            !open && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Valuta la tua competenza
              </span>
            )
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform ease-[var(--ease-snap)] duration-150",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {howToTest && (
            <p className="text-sm text-muted-foreground">{howToTest}</p>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Quanto ti senti competente su questo tema?
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={savingRating}
                  onClick={() => handleRate(n)}
                  aria-pressed={rating === n}
                  aria-label={`Competenza ${n} su 10`}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-sm font-mono text-xs outline-none transition-colors ease-[var(--ease-snap)] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                    rating !== null && n <= rating
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  )}
                >
                  {n}
                </button>
              ))}
              {savingRating && (
                <Loader2 className="ml-1 size-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {sessionId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/coaches/${coachId}/sessions/${sessionId}`}>
                  <MessageSquare className="size-3.5" />
                  Apri la conversazione
                </Link>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Conversazione di origine non disponibile.
              </span>
            )}
            <Button
              onClick={handleToggleStatus}
              disabled={savingStatus}
              variant="outline"
              size="sm"
            >
              {savingStatus && <Loader2 className="size-3.5 animate-spin" />}
              {status === "open" ? "Chiudi" : "Riapri"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
