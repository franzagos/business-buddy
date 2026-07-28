import { asc, desc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import type { CoachId } from "./index";

const MAX_KB_CHARS = 8_000;

/**
 * Finds the business (if any) tagged to this coach for this user. When more
 * than one business matches, the most recently updated one wins. Shared by
 * the system-prompt builder below and any UI that needs to show which
 * business is currently "in context" for the active coach.
 */
export async function findMatchingBusiness(userId: string, coachId: CoachId) {
  const [match] = await db
    .select({
      id: business.id,
      name: business.name,
      context: business.context,
      notes: business.notes,
    })
    .from(business)
    .where(and(eq(business.ownerUserId, userId), eq(business.businessType, coachId)))
    .orderBy(desc(business.updatedAt))
    .limit(1);

  return match ?? null;
}

/**
 * If the user has described a business tagged to this coach, fold it into
 * the system prompt along with any knowledge-base documents attached to it.
 * When more than one business matches the coach, the most recently updated
 * one wins. Businesses that don't match the active coach are not injected —
 * keeps the context relevant instead of noisy.
 */
export async function buildBusinessContext(
  userId: string,
  coachId: CoachId
): Promise<string> {
  const match = await findMatchingBusiness(userId, coachId);

  if (!match || (!match.context && !match.notes)) return "";

  const lines: string[] = [];
  if (match.context) lines.push(`Business context: ${match.context}`);
  if (match.notes) lines.push(`Other useful info: ${match.notes}`);

  const docs = await db
    .select({ fileName: businessDocument.fileName, content: businessDocument.content })
    .from(businessDocument)
    .where(eq(businessDocument.businessId, match.id))
    .orderBy(asc(businessDocument.createdAt))
    .limit(5);

  let kbSection = "";
  const docsWithContent = docs.filter((d) => d.content);
  if (docsWithContent.length > 0) {
    let combined = docsWithContent
      .map((d) => `--- ${d.fileName} ---\n${d.content}`)
      .join("\n\n");
    let truncated = false;
    if (combined.length > MAX_KB_CHARS) {
      combined = combined.slice(0, MAX_KB_CHARS);
      truncated = true;
    }
    kbSection = `\n\nKnowledge base for this business${truncated ? " (troncato)" : ""}:\n\n${combined}`;
  }

  const instruction =
    "This business matches the current coach's domain: use it by default as the worked example in exercises and cases, unless the user explicitly asks for a different scenario in this conversation." +
    (kbSection
      ? " Knowledge-base documents are attached below as reference material — use them as background detail, not as the primary source of truth over what the user says in conversation."
      : "");

  return `\n\n---\n\nThis person's real business:\n\n${lines.join("\n")}${kbSection}\n\n${instruction}`;
}
