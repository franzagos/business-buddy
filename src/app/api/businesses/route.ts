import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import {
  apiResponse,
  requireApiAuth,
  applyRateLimit,
  parseBody,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";

const businessTypeSchema = z
  .enum(["executive", "agency", "startup", "general", "none"])
  .transform((v) => (v === "none" ? null : v));

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  businessType: businessTypeSchema,
  context: z.string().trim().max(4000),
  notes: z.string().trim().max(4000),
});

/** GET — the current user's businesses, most recently updated first. */
export async function GET() {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const businesses = await db
    .select({
      id: business.id,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      notes: business.notes,
      updatedAt: business.updatedAt,
    })
    .from(business)
    .where(eq(business.ownerUserId, session.user.id))
    .orderBy(desc(business.updatedAt))
    .limit(50);

  return apiResponse({ businesses });
}

/** POST — create a new business for the current user. */
export async function POST(req: Request) {
  const limited = await applyRateLimit("businesses-create", RATE_LIMITS.api);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [created] = await db
    .insert(business)
    .values({
      ownerUserId: session.user.id,
      name: data.name,
      businessType: data.businessType,
      context: data.context,
      notes: data.notes,
    })
    .returning({
      id: business.id,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      notes: business.notes,
    });

  return apiResponse({ business: created }, 201);
}
