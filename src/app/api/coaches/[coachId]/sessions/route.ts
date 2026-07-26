import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { apiResponse, apiError, requireApiAuth } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { coachingSession, coachingMessage } from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Unknown coach" }),
});

/** GET — list the current user's sessions for this coach. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return apiError("Unknown coach", 404);
  }
  const { coachId } = parsed.data;

  const sessions = await db
    .select({
      id: coachingSession.id,
      title: coachingSession.title,
      track: coachingSession.track,
      register: coachingSession.register,
      createdAt: coachingSession.createdAt,
      updatedAt: coachingSession.updatedAt,
    })
    .from(coachingSession)
    .where(
      and(
        eq(coachingSession.userId, session.user.id),
        eq(coachingSession.coachId, coachId)
      )
    )
    .orderBy(desc(coachingSession.updatedAt))
    .limit(50);

  return apiResponse({ sessions });
}

/** POST — create a new session for this coach, seeded with the welcome message. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return apiError("Unknown coach", 404);
  }
  const { coachId } = parsed.data;
  const coach = getCoach(coachId);

  const [newSession] = await db
    .insert(coachingSession)
    .values({
      userId: session.user.id,
      coachId,
    })
    .returning();

  await db.insert(coachingMessage).values({
    sessionId: newSession.id,
    role: "assistant",
    content: coach.welcomeMessage,
  });

  return apiResponse({ session: newSession }, 201);
}
