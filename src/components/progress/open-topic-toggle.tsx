"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface OpenTopicToggleProps {
  id: string;
  status: "open" | "closed";
}

export function OpenTopicToggle({ id, status }: OpenTopicToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const nextStatus = status === "open" ? "closed" : "open";
    try {
      const res = await fetch(`/api/open-topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        toast.error("Non sono riuscito ad aggiornare il tema. Riprova.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Non sono riuscito ad aggiornare il tema. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant="outline"
      size="sm"
      className="shrink-0"
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {status === "open" ? "Chiudi" : "Riapri"}
    </Button>
  );
}
