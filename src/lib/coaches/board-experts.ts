import { asc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { boardExpert } from "@/lib/schema";
import type { CoachId } from "./index";

/**
 * Admin-curated Advisory Board experts for a given coach, from the
 * `board_expert` table — additive to the static roster in
 * `src/lib/coaches/{coach}/advisory-board.ts`. `coachId = null` rows are
 * available to every coach. Ordered oldest-first so newly added experts
 * appear after the curated static roster, not jumbled in.
 */
export async function getExtraAdvisors(
  coachId: CoachId
): Promise<{ id: string; name: string; lens: string; style: string }[]> {
  return db
    .select({
      id: boardExpert.id,
      name: boardExpert.name,
      lens: boardExpert.lens,
      style: boardExpert.style,
    })
    .from(boardExpert)
    .where(or(eq(boardExpert.coachId, coachId), isNull(boardExpert.coachId)))
    .orderBy(asc(boardExpert.createdAt))
    .limit(50);
}
