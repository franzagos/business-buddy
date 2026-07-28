import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { apiResponse, apiError, requireApiAuth, applyRateLimit, parseBody } from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { hiddenBoardExpert } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";

const bodySchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Coach sconosciuto" }),
  expertId: z.string().trim().min(1).max(200),
});

async function requireAdmin() {
  const { session, error } = await requireApiAuth();
  if (error) return { session: null as null, error };

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || session.user.email !== ownerEmail) {
    return { session: null as null, error: apiError("Non trovato", 404) };
  }
  return { session, error: null };
}

/** POST — hide a static Advisory Board expert for a coach (admin only). */
export async function POST(req: Request) {
  const limited = await applyRateLimit("admin-hidden-experts-create", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  // Hiding an already-hidden expert is a no-op success, not an error.
  await db
    .insert(hiddenBoardExpert)
    .values({ coachId: data.coachId, expertId: data.expertId })
    .onConflictDoNothing();

  return apiResponse({ success: true }, 201);
}

/** DELETE — restore (un-hide) a static Advisory Board expert (admin only). */
export async function DELETE(req: Request) {
  const limited = await applyRateLimit("admin-hidden-experts-delete", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  await db
    .delete(hiddenBoardExpert)
    .where(
      and(
        eq(hiddenBoardExpert.coachId, data.coachId),
        eq(hiddenBoardExpert.expertId, data.expertId)
      )
    );

  return apiResponse({ success: true });
}
