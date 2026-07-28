/**
 * One-time backfill: runs memory extraction (progress_entry / open_topic /
 * blind_spot_pattern) for sessions that have real conversation content but
 * were never explicitly "ended" — so the Progress page has data for them
 * instead of showing them as evaluated nowhere.
 *
 * Safe to re-run: skips sessions that already have a progress_entry.
 */
import { eq, notInArray } from "drizzle-orm";
import { db } from "../src/lib/db";
import { coachingSession, coachingMessage, progressEntry } from "../src/lib/schema";
import { extractMemory } from "../src/lib/coaches/memory";

async function main() {
  const alreadyEvaluated = await db
    .select({ sessionId: progressEntry.sessionId })
    .from(progressEntry);
  const evaluatedIds = alreadyEvaluated
    .map((e) => e.sessionId)
    .filter((id): id is string => id !== null);

  const candidates = evaluatedIds.length
    ? await db
        .select({ id: coachingSession.id })
        .from(coachingSession)
        .where(notInArray(coachingSession.id, evaluatedIds))
    : await db.select({ id: coachingSession.id }).from(coachingSession);

  console.log(`[backfill-progress-entries] ${candidates.length} session(s) without a progress entry.`);

  let created = 0;
  let skipped = 0;

  for (const { id } of candidates) {
    const messages = await db
      .select({ role: coachingMessage.role })
      .from(coachingMessage)
      .where(eq(coachingMessage.sessionId, id));
    const userMessages = messages.filter((m) => m.role === "user").length;

    if (userMessages === 0) {
      skipped++;
      continue;
    }

    const entry = await extractMemory(id);
    if (entry) {
      created++;
      console.log(`[backfill-progress-entries] Created progress entry for session ${id}.`);
    } else {
      skipped++;
      console.log(`[backfill-progress-entries] No entry extracted for session ${id} (too short or model returned nothing).`);
    }
  }

  console.log(`[backfill-progress-entries] Done. created=${created} skipped=${skipped}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("[backfill-progress-entries] Fatal error:", error);
  process.exit(1);
});
