import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiResponse, apiError, requireApiAuth, parseBody } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { coachingSession } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Unknown coach" }),
  sessionId: z.string().uuid(),
});

const patchBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
});

/** PATCH — rename a session (title only, for now). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ coachId: string; sessionId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError("Unknown coach or session", 404);
  }
  const { coachId, sessionId } = parsedParams.data;

  const { data, error: bodyError } = await parseBody(req, patchBodySchema);
  if (bodyError) return bodyError;

  const [existing] = await db
    .select({ id: coachingSession.id, userId: coachingSession.userId })
    .from(coachingSession)
    .where(
      and(eq(coachingSession.id, sessionId), eq(coachingSession.coachId, coachId))
    )
    .limit(1);

  if (!existing || existing.userId !== session.user.id) {
    return apiError("Session not found", 404);
  }

  await db
    .update(coachingSession)
    .set({ title: data.title })
    .where(eq(coachingSession.id, sessionId));

  return apiResponse({ title: data.title });
}
