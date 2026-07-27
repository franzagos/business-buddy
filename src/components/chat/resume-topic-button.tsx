"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoachId } from "@/lib/coaches";

interface ResumeTopicButtonProps {
  coachId: CoachId;
  topic: string;
}

/**
 * Creates a new session for `coachId` and drops the user straight into it
 * with `topic` pre-filled as a draft message (not auto-sent — the user
 * still reviews/edits before it goes out). Used to turn an open topic on
 * the dashboard into a one-click way back into a stalled thread (Zeigarnik
 * effect — see specs/coaching-platform's neuromarketing notes).
 */
export function ResumeTopicButton({ coachId, topic }: ResumeTopicButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/coaches/${coachId}/sessions`, {
        method: "POST",
      });
      if (!res.ok) return;
      const { session: newSession } = await res.json();
      router.push(
        `/coaches/${coachId}/sessions/${newSession.id}?draft=${encodeURIComponent(topic)}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowRight className="size-4" />
      )}
      Riprendi da qui
    </Button>
  );
}
