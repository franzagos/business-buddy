import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  apiResponse,
  apiError,
  requireApiAuth,
  applyRateLimit,
  parseBody,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import { deleteFile } from "@/lib/storage";

const paramsSchema = z.object({ businessId: z.string().uuid() });

const businessTypeSchema = z
  .enum(["executive", "agency", "startup", "general", "none"])
  .transform((v) => (v === "none" ? null : v));

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  businessType: businessTypeSchema,
  context: z.string().trim().max(4000),
  notes: z.string().trim().max(4000),
});

/** GET — a single business, ownership-checked. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Non trovato", 404);

  const [existing] = await db
    .select({
      id: business.id,
      ownerUserId: business.ownerUserId,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      notes: business.notes,
      updatedAt: business.updatedAt,
    })
    .from(business)
    .where(eq(business.id, parsedParams.data.businessId))
    .limit(1);

  if (!existing || existing.ownerUserId !== session.user.id) {
    return apiError("Non trovato", 404);
  }

  const { ownerUserId: _omit, ...result } = existing;
  return apiResponse({ business: result });
}

/** PATCH — update a business, ownership-checked. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const limited = await applyRateLimit("businesses-update", RATE_LIMITS.api);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Non trovato", 404);

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [existing] = await db
    .select({ id: business.id, ownerUserId: business.ownerUserId })
    .from(business)
    .where(eq(business.id, parsedParams.data.businessId))
    .limit(1);

  if (!existing || existing.ownerUserId !== session.user.id) {
    return apiError("Non trovato", 404);
  }

  const [updated] = await db
    .update(business)
    .set({
      name: data.name,
      businessType: data.businessType,
      context: data.context,
      notes: data.notes,
    })
    .where(eq(business.id, existing.id))
    .returning({
      id: business.id,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      notes: business.notes,
    });

  return apiResponse({ business: updated });
}

/** DELETE — remove a business, its stored files, and its documents (cascade). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const limited = await applyRateLimit("businesses-delete", RATE_LIMITS.api);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Non trovato", 404);

  const [existing] = await db
    .select({ id: business.id, ownerUserId: business.ownerUserId })
    .from(business)
    .where(eq(business.id, parsedParams.data.businessId))
    .limit(1);

  if (!existing || existing.ownerUserId !== session.user.id) {
    return apiError("Non trovato", 404);
  }

  const docs = await db
    .select({ fileUrl: businessDocument.fileUrl })
    .from(businessDocument)
    .where(eq(businessDocument.businessId, existing.id))
    .limit(50);

  await Promise.all(
    docs.map((d) => deleteFile(d.fileUrl).catch(() => undefined))
  );

  await db.delete(business).where(eq(business.id, existing.id));

  return apiResponse({ success: true });
}
