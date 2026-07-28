/**
 * Track vocabulary shared across the app. A coach's methodology has two
 * tracks (see persona.ts "BINARIO A / BINARIO B"): training (fictional
 * cases, "Metodo dei Casi") and consulting (the user's real case). The URL
 * slug ("coaching") and the DB value ("consulting") differ intentionally —
 * the slug is the user-facing label, the DB value matches the naming
 * already used in specs/coaching-platform/decisions.md.
 */

export type TrackSlug = "training" | "coaching";
export type SessionTrack = "training" | "consulting";

export function isTrackSlug(v: string): v is TrackSlug {
  return v === "training" || v === "coaching";
}

export const TRACK_SLUG_TO_DB: Record<TrackSlug, SessionTrack> = {
  training: "training",
  coaching: "consulting",
};

export const TRACK_DB_TO_SLUG: Record<SessionTrack, TrackSlug> = {
  training: "training",
  consulting: "coaching",
};

export const TRACK_META: Record<
  TrackSlug,
  { label: string; description: string; icon: string }
> = {
  training: {
    label: "Allenamento",
    description: "Casi costruiti per allenarti, non un problema reale.",
    icon: "Dumbbell",
  },
  coaching: {
    label: "Coaching",
    description: "Porti un problema reale della tua azienda.",
    icon: "MessageCircleHeart",
  },
};
