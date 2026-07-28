import { z } from "zod";
import { apiResponse, apiError, requireApiAuth, applyRateLimit, parseBody } from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { boardExpert } from "@/lib/schema";
import { parseAdvisoryMarkdown } from "@/lib/coaches/parse-advisory-markdown";

const coachIdOrAllSchema = z
  .enum(["executive", "agency", "startup", "all"])
  .transform((v) => (v === "all" ? null : v));

const bodySchema = z.object({
  markdown: z.string().trim().min(1).max(100000),
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

/** POST — bulk-import board experts from Advisory-Board.md markdown (admin only). */
export async function POST(req: Request) {
  const limited = await applyRateLimit("admin-experts-bulk", RATE_LIMITS.api);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const { parsed, skipped, missingLens } = parseAdvisoryMarkdown(data.markdown);

  if (parsed.length === 0) {
    return apiError("Nessun esperto valido trovato nel markdown", 400, {
      skipped: skipped.map((s) => `${s.heading}: ${s.reason}`),
    });
  }

  const created = await db
    .insert(boardExpert)
    .values(
      parsed.map((p) => ({
        coachId: data.coachId,
        name: p.name,
        lens: p.lens,
        style: p.style,
      }))
    )
    .returning({ id: boardExpert.id, name: boardExpert.name });

  return apiResponse({
    created: created.length,
    createdNames: created.map((c) => c.name),
    skipped: skipped.length,
    skippedReasons: skipped.map((s) => `${s.heading}: ${s.reason}`),
    missingLens,
  });
}
