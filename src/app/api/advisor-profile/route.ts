import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {
  apiResponse,
  requireApiAuth,
  parseBody,
  applyRateLimit,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { advisorProfile } from "@/lib/schema";

/** GET — the current user's own advisor profile (ownerUserId = me, isShared = false). */
export async function GET() {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const limited = await applyRateLimit("advisor-profile", RATE_LIMITS.api);
  if (limited) return limited;

  const [profile] = await db
    .select({
      id: advisorProfile.id,
      name: advisorProfile.name,
      whatTheyThink: advisorProfile.whatTheyThink,
      howTheyDecide: advisorProfile.howTheyDecide,
      updatedAt: advisorProfile.updatedAt,
    })
    .from(advisorProfile)
    .where(
      and(
        eq(advisorProfile.ownerUserId, session.user.id),
        eq(advisorProfile.isShared, false)
      )
    )
    .limit(1);

  return apiResponse({ profile: profile ?? null });
}

const bodySchema = z.object({
  whatTheyThink: z.string().trim().max(4000),
  howTheyDecide: z.string().trim().max(4000),
});

/** PUT — upsert the current user's own advisor profile. */
export async function PUT(req: Request) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const limited = await applyRateLimit("advisor-profile", RATE_LIMITS.api);
  if (limited) return limited;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [existing] = await db
    .select({ id: advisorProfile.id })
    .from(advisorProfile)
    .where(
      and(
        eq(advisorProfile.ownerUserId, session.user.id),
        eq(advisorProfile.isShared, false)
      )
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(advisorProfile)
      .set({
        whatTheyThink: data.whatTheyThink,
        howTheyDecide: data.howTheyDecide,
      })
      .where(eq(advisorProfile.id, existing.id))
      .returning({
        id: advisorProfile.id,
        name: advisorProfile.name,
        whatTheyThink: advisorProfile.whatTheyThink,
        howTheyDecide: advisorProfile.howTheyDecide,
      });
    return apiResponse({ profile: updated });
  }

  const [created] = await db
    .insert(advisorProfile)
    .values({
      ownerUserId: session.user.id,
      name: session.user.name || "Il mio profilo",
      whatTheyThink: data.whatTheyThink,
      howTheyDecide: data.howTheyDecide,
      isShared: false,
    })
    .returning({
      id: advisorProfile.id,
      name: advisorProfile.name,
      whatTheyThink: advisorProfile.whatTheyThink,
      howTheyDecide: advisorProfile.howTheyDecide,
    });

  return apiResponse({ profile: created }, 201);
}
