import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiResponse, apiError, requireApiAuth, applyRateLimit } from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { boardExpert } from "@/lib/schema";

const paramsSchema = z.object({ id: z.string().uuid() });

async function requireAdmin() {
  const { session, error } = await requireApiAuth();
  if (error) return { session: null as null, error };

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || session.user.email !== ownerEmail) {
    return { session: null as null, error: apiError("Non trovato", 404) };
  }
  return { session, error: null };
}

/** DELETE — remove a board expert (admin only). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await applyRateLimit("admin-experts-delete", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Non trovato", 404);

  const [existing] = await db
    .select({ id: boardExpert.id })
    .from(boardExpert)
    .where(eq(boardExpert.id, parsedParams.data.id))
    .limit(1);

  if (!existing) return apiError("Non trovato", 404);

  await db.delete(boardExpert).where(eq(boardExpert.id, existing.id));

  return apiResponse({ success: true });
}
