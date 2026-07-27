"use client";

import { Coachmark, useCoachmark } from "@/components/ui/coachmark";

export function ProgressPageCoachmark() {
  const coachmark = useCoachmark("progress-page");

  if (!coachmark.visible) return null;

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-40">
        <Coachmark
          title="Questa pagina cresce con te"
          description="Punteggi, temi aperti e pattern ricorrenti si accumulano sessione dopo sessione: più ti alleni con il coach, più diventa utile."
          onDismiss={coachmark.dismiss}
        />
      </div>
    </div>
  );
}
