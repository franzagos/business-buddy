import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {
  apiResponse,
  apiError,
  requireApiAuth,
  applyRateLimit,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import { deleteFile } from "@/lib/storage";

const paramsSchema = z.object({
  businessId: z.string().uuid(),
  documentId: z.string().uuid(),
});

/** DELETE — remove a document, ownership-checked through the parent business. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ businessId: string; documentId: string }> }
) {
  const limited = await applyRateLimit("businesses-doc-delete", RATE_LIMITS.api);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Non trovato", 404);
  const { businessId, documentId } = parsedParams.data;

  const [existing] = await db
    .select({
      id: businessDocument.id,
      fileUrl: businessDocument.fileUrl,
      ownerUserId: business.ownerUserId,
    })
    .from(businessDocument)
    .innerJoin(business, eq(businessDocument.businessId, business.id))
    .where(
      and(
        eq(businessDocument.id, documentId),
        eq(businessDocument.businessId, businessId)
      )
    )
    .limit(1);

  if (!existing || existing.ownerUserId !== session.user.id) {
    return apiError("Non trovato", 404);
  }

  await deleteFile(existing.fileUrl).catch(() => undefined);
  await db.delete(businessDocument).where(eq(businessDocument.id, existing.id));

  return apiResponse({ success: true });
}
