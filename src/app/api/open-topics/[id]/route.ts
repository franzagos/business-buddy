import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  apiError,
  apiResponse,
  requireApiAuth,
  parseBody,
} from "@/lib/api-utils";
import { db } from "@/lib/db";
import { openTopic } from "@/lib/schema";

const paramsSchema = z.object({ id: z.string().uuid() });

const bodySchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  competenceRating: z.number().int().min(1).max(10).nullable().optional(),
});

/** PATCH — toggle an open topic's status (open <-> closed) for its owner. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError("Non trovato", 404);
  }
  const { id } = parsedParams.data;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  if (data.status === undefined && data.competenceRating === undefined) {
    return apiError("Niente da aggiornare", 400);
  }

  const [existing] = await db
    .select({ id: openTopic.id, userId: openTopic.userId })
    .from(openTopic)
    .where(eq(openTopic.id, id))
    .limit(1);

  if (!existing || existing.userId !== session.user.id) {
    return apiError("Non trovato", 404);
  }

  const [updated] = await db
    .update(openTopic)
    .set({
      ...(data.status !== undefined && {
        status: data.status,
        closedAt: data.status === "closed" ? new Date() : null,
      }),
      ...(data.competenceRating !== undefined && {
        competenceRating: data.competenceRating,
      }),
    })
    .where(eq(openTopic.id, id))
    .returning({
      id: openTopic.id,
      status: openTopic.status,
      closedAt: openTopic.closedAt,
      competenceRating: openTopic.competenceRating,
    });

  return apiResponse({ topic: updated });
}
