"use client";

import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface RecapScore {
  dimension: string;
  label: string;
  score: number;
  note: string | null;
  delta: number | null;
}

export interface SessionRecap {
  decision: string | null;
  lesson: string | null;
  register: string | null;
  scores: RecapScore[];
}

interface SessionRecapDialogProps {
  recap: SessionRecap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function average(scores: RecapScore[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

export function SessionRecapDialog({
  recap,
  open,
  onOpenChange,
}: SessionRecapDialogProps) {
  if (!recap) return null;
  const avg = average(recap.scores);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles className="size-5 text-accent" />
            Sessione conclusa
          </DialogTitle>
          <DialogDescription>
            Ecco cosa è emerso e come te la sei cavata questa volta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {avg !== null && (
            <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Voto medio della sessione
              </span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-accent">
                {avg.toFixed(1)}
                <span className="text-sm text-muted-foreground">/10</span>
              </span>
            </div>
          )}

          {recap.scores.length > 0 && (
            <div className="space-y-2">
              {recap.scores.map((s) => (
                <div
                  key={s.dimension}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-foreground">{s.label}</span>
                  <span className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="text-foreground">{s.score}/10</span>
                    {typeof s.delta === "number" && s.delta !== 0 && (
                      <span
                        className={cnDelta(s.delta)}
                        aria-label={
                          s.delta > 0
                            ? `migliorato di ${s.delta} punti rispetto alla volta scorsa`
                            : `peggiorato di ${Math.abs(s.delta)} punti rispetto alla volta scorsa`
                        }
                      >
                        {s.delta > 0 ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {s.delta > 0 ? "+" : ""}
                        {s.delta}
                      </span>
                    )}
                    {typeof s.delta === "number" && s.delta === 0 && (
                      <Minus className="size-3.5 text-muted-foreground" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {recap.lesson && (
            <div className="space-y-1 border-t border-border pt-4">
              <p className="text-xs font-medium tracking-wide text-accent uppercase">
                Cosa hai imparato
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {recap.lesson}
              </p>
            </div>
          )}

          {recap.decision && (
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Decisione presa
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {recap.decision}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cnDelta(delta: number) {
  return `flex items-center gap-0.5 ${delta > 0 ? "text-accent" : "text-destructive"}`;
}
