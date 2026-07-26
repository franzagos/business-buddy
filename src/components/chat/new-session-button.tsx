"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CoachId } from "@/lib/coaches";

interface NewSessionButtonProps {
  coachId: CoachId;
  variant?: "default" | "accent" | "outline";
}

export function NewSessionButton({
  coachId,
  variant = "default",
}: NewSessionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/coaches/${coachId}/sessions`, {
        method: "POST",
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
      Nuova sessione
    </Button>
  );
}
