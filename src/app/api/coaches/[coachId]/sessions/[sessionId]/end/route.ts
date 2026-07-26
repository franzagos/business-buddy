import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiError, apiResponse, requireApiAuth } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { coachingSession } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";
import { extractMemory } from "@/lib/coaches/memory";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Unknown coach" }),
  sessionId: z.string().uuid(),
});

/**
 * POST — explicit "End session & save progress" action. Runs memory
 * extraction against the full transcript synchronously so the caller can
 * show a reliable success/failure confirmation.
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

  await extractMemory(sessionId);

  return apiResponse({ ok: true });
}
