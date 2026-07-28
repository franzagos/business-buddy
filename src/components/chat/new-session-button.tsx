"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CoachId } from "@/lib/coaches";
import type { SessionTrack } from "@/lib/coaches/track";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";

interface NewSessionButtonProps {
  coachId: CoachId;
  variant?: "default" | "accent" | "outline";
  track?: SessionTrack;
  label?: string;
}

export function NewSessionButton({
  coachId,
  variant = "default",
  track,
  label = DEFAULT_SESSION_TITLE,
}: NewSessionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/coaches/${coachId}/sessions`, {
        method: "POST",
        headers: track ? { "Content-Type": "application/json" } : undefined,
        body: track ? JSON.stringify({ track }) : undefined,
      });
      if (!res.ok) {
        toast.error("Non sono riuscito a creare la sessione. Riprova.");
        return;
      }
      const { session } = await res.json();
      router.push(`/coaches/${coachId}/sessions/${session.id}`);
    } catch {
      toast.error("Non sono riuscito a creare la sessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant={variant} size="lg">
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {label}
    </Button>
  );
}
