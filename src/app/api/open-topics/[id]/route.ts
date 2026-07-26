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
  status: z.enum(["open", "closed"]),
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
    return apiError("Not found", 404);
  }
  const { id } = parsedParams.data;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [existing] = await db
    .select({ id: openTopic.id, userId: openTopic.userId })
    .from(openTopic)
    .where(eq(openTopic.id, id))
    .limit(1);

  if (!existing || existing.userId !== session.user.id) {
    return apiError("Not found", 404);
  }

  const [updated] = await db
    .update(openTopic)
    .set({
      status: data.status,
      closedAt: data.status === "closed" ? new Date() : null,
    })
    .where(eq(openTopic.id, id))
    .returning({
      id: openTopic.id,
      status: openTopic.status,
      closedAt: openTopic.closedAt,
    });

  return apiResponse({ topic: updated });
}
