import { z } from "zod";
import { and, desc, eq, lt } from "drizzle-orm";
import { apiError, apiResponse, requireApiAuth } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { coachingSession, progressEntry } from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";
import { extractMemory } from "@/lib/coaches/memory";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Unknown coach" }),
  sessionId: z.string().uuid(),
});

interface ScoreRow {
  dimension: string;
  score: number;
  note?: string | null;
}

/**
 * POST — explicit "End session & save progress" action. Runs memory
 * extraction against the full transcript synchronously, then builds a
 * recap (lesson, decision, rubric scores with deltas vs. the previous
 * session) so the caller can show it immediately — this is the product's
 * peak-end moment, not just a background save.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ coachId: string; sessionId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return apiError("Not found", 404);
  }
  const { coachId, sessionId } = parsed.data;

  const [existingSession] = await db
    .select({
      id: coachingSession.id,
      userId: coachingSession.userId,
      coachId: coachingSession.coachId,
    })
    .from(coachingSession)
    .where(eq(coachingSession.id, sessionId))
    .limit(1);

  if (
    !existingSession ||
    existingSession.userId !== session.user.id ||
    existingSession.coachId !== coachId
  ) {
    return apiError("Not found", 404);
  }

  const entry = await extractMemory(sessionId);

  if (!entry) {
    // Nothing substantial to recap (e.g. the session was too short).
    return apiResponse({ ok: true, recap: null });
  }

  const [previous] = await db
    .select({ scores: progressEntry.scores })
    .from(progressEntry)
    .where(
      and(
        eq(progressEntry.userId, session.user.id),
        eq(progressEntry.coachId, coachId),
        lt(progressEntry.createdAt, entry.createdAt)
      )
    )
    .orderBy(desc(progressEntry.createdAt))
    .limit(1);

  const previousScores = (previous?.scores as ScoreRow[] | null) ?? [];
  const currentScores = (entry.scores as ScoreRow[] | null) ?? [];
  const rubric = getCoach(coachId).rubric;
  const labelFor = (dimension: string) =>
    rubric.find((r) => r.id === dimension)?.label ?? dimension;

  const scores = currentScores.map((s) => {
    const prev = previousScores.find((p) => p.dimension === s.dimension);
    return {
      dimension: s.dimension,
      label: labelFor(s.dimension),
      score: s.score,
      note: s.note ?? null,
      delta: prev ? s.score - prev.score : null,
    };
  });

  return apiResponse({
    ok: true,
    recap: {
      decision: entry.decision,
      lesson: entry.lesson,
      register: entry.register,
      scores,
    },
  });
}
