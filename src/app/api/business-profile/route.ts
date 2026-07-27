import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiResponse, requireApiAuth, parseBody } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { COACH_IDS } from "@/lib/coaches";

/** GET — the current user's business profile (one row per user, may not exist yet). */
export async function GET() {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const [profile] = await db
    .select({
      businessType: businessProfile.businessType,
      context: businessProfile.context,
      notes: businessProfile.notes,
    })
    .from(businessProfile)
    .where(eq(businessProfile.userId, session.user.id))
    .limit(1);

  return apiResponse({ profile: profile ?? null });
}

const bodySchema = z.object({
  businessType: z.enum([...COACH_IDS, "other", "none"]),
  context: z.string().trim().max(4000),
  notes: z.string().trim().max(4000),
});

/** PUT — upsert the current user's business profile. */
export async function PUT(req: Request) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const businessType = data.businessType === "none" ? null : data.businessType;

  const [profile] = await db
    .insert(businessProfile)
    .values({
      userId: session.user.id,
      businessType,
      context: data.context,
      notes: data.notes,
    })
    .onConflictDoUpdate({
      target: businessProfile.userId,
      set: {
        businessType,
        context: data.context,
        notes: data.notes,
      },
    })
    .returning({
      businessType: businessProfile.businessType,
      context: businessProfile.context,
      notes: businessProfile.notes,
    });

  return apiResponse({ profile });
}
