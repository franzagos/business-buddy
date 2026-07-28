import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hiddenBoardExpert } from "@/lib/schema";
import type { CoachId } from "./index";

/**
 * IDs of static Advisory Board experts (from
 * src/lib/coaches/{coach}/advisory-board.ts) hidden by the admin for a given
 * coach. Static experts always belong to exactly one coach, so an exact
 * coachId match is enough — unlike `getExtraAdvisors`, there's no "all
 * coaches" case to account for here.
 */
export async function getHiddenExpertIds(coachId: CoachId): Promise<Set<string>> {
  const rows = await db
    .select({ expertId: hiddenBoardExpert.expertId })
    .from(hiddenBoardExpert)
    .where(eq(hiddenBoardExpert.coachId, coachId));
  return new Set(rows.map((r) => r.expertId));
}
