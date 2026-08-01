import { z } from "zod";
import { desc } from "drizzle-orm";
import {
  apiResponse,
  apiError,
  requireApiAuth,
  applyRateLimit,
  parseBody,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { boardExpert } from "@/lib/schema";

const coachIdOrAllSchema = z
  .enum(["executive", "agency", "startup", "all"])
  .transform((v) => (v === "all" ? null : v));

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  lens: z.string().trim().min(1).max(2000),
  style: z.string().trim().min(1).max(4000),
  coachId: coachIdOrAllSchema,
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

/** GET — list all board experts (admin only). */
export async function GET() {
  const limited = await applyRateLimit("admin-experts-list", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await db
    .select({
      id: boardExpert.id,
      coachId: boardExpert.coachId,
      name: boardExpert.name,
      lens: boardExpert.lens,
      style: boardExpert.style,
      createdAt: boardExpert.createdAt,
    })
    .from(boardExpert)
    .orderBy(desc(boardExpert.createdAt))
    .limit(200);

  return apiResponse({ experts: rows });
}

/** POST — create a board expert (admin only). */
export async function POST(req: Request) {
  const limited = await applyRateLimit("admin-experts-create", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [created] = await db
    .insert(boardExpert)
    .values({
      coachId: data.coachId,
      name: data.name,
      lens: data.lens,
      style: data.style,
    })
    .returning({
      id: boardExpert.id,
      coachId: boardExpert.coachId,
      name: boardExpert.name,
      lens: boardExpert.lens,
      style: boardExpert.style,
      createdAt: boardExpert.createdAt,
    });

  return apiResponse({ expert: created }, 201);
}
