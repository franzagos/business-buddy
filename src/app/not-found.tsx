import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-8">
      <div className="max-w-md space-y-4 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Compass className="size-5" />
        </span>
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Pagina non trovata
          </h2>
          <p className="text-sm text-muted-foreground">
            La pagina che cerchi non esiste o è stata spostata.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/">Torna alla home</Link>
        </Button>
      </div>
    </div>
  );
}
