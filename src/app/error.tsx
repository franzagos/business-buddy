"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-8">
      <div className="max-w-md space-y-4 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-secondary text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Qualcosa è andato storto
          </h2>
          <p className="text-sm text-muted-foreground">
            Si è verificato un errore imprevisto. Riprova, e se il problema
            continua contattaci.
          </p>
        </div>
        <Button onClick={reset} variant="accent">
          Riprova
        </Button>
      </div>
    </div>
  );
}
