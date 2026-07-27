import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import type { CoachId } from "./index";

/**
 * If the user has described their own business, fold it into the system
 * prompt. When `businessType` matches the active coach, the coach is told
 * to default to that business as the worked example in exercises unless
 * the user says otherwise in the conversation.
 */
export async function buildBusinessContext(
  userId: string,
  coachId: CoachId
): Promise<string> {
  const [profile] = await db
    .select({
      businessType: businessProfile.businessType,
      context: businessProfile.context,
      notes: businessProfile.notes,
    })
    .from(businessProfile)
    .where(eq(businessProfile.userId, userId))
    .limit(1);

  if (!profile || (!profile.context && !profile.notes)) return "";

  const lines: string[] = [];
  if (profile.context) lines.push(`Business context: ${profile.context}`);
  if (profile.notes) lines.push(`Other useful info: ${profile.notes}`);

  const matchesCoach = profile.businessType === coachId;
  const instruction = matchesCoach
    ? "This business matches the current coach's domain: use it by default as the worked example in exercises and cases, unless the user explicitly asks for a different scenario in this conversation."
    : "This business does not necessarily match the current coach's domain — use it as background context, not automatically as the default case example.";

  return `\n\n---\n\nThis person's real business:\n\n${lines.join("\n")}\n\n${instruction}`;
}
