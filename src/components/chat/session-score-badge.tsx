import { Badge } from "@/components/ui/badge";

interface Score {
  dimension: string;
  score: number;
  note?: string | null;
}

interface SessionScoreBadgeProps {
  scores: unknown;
  register: string | null;
}

/**
 * Small badge row shown next to a session in a list: the average rubric
 * score for that session (if a progress entry exists) and the register
 * (wartime/peacetime) it was logged under. Both come from `progress_entry`,
 * associated via `sessionId` — `coaching_session.register` is never
 * populated, so the entry-level field is the source of truth here.
 */
export function SessionScoreBadge({ scores, register }: SessionScoreBadgeProps) {
  const list = Array.isArray(scores) ? (scores as Score[]) : [];
  const avg =
    list.length > 0
      ? list.reduce((sum, s) => sum + s.score, 0) / list.length
      : null;

  if (avg === null && !register) return null;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {avg !== null && (
        <Badge variant="secondary" className="font-mono tabular-nums">
          {avg.toFixed(1)}/10
        </Badge>
      )}
      {register && <Badge variant="outline">{register}</Badge>}
    </div>
  );
}
