import { z } from "zod";
import { and, asc, desc, eq } from "drizzle-orm";
import { streamText } from "ai";
import {
  apiError,
  requireApiAuth,
  applyRateLimit,
  parseBody,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  coachingSession,
  coachingMessage,
  progressEntry,
  openTopic,
  blindSpotPattern,
} from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";
import { getModel } from "@/lib/ai/models";
import { maybeExtractMemory } from "@/lib/coaches/memory";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Unknown coach" }),
  sessionId: z.string().uuid(),
});

const bodySchema = z.object({
  content: z.string().trim().min(1).max(8000),
});

const WRAP_UP_KEYWORDS = [
  "salviamo",
  "chiudiamo",
  "abbiamo finito",
  "salva",
  "save",
  "let's wrap up",
  "wrap up",
  "let's save",
];

function looksLikeWrapUp(content: string): boolean {
  const normalized = content.toLowerCase();
  return WRAP_UP_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

/** Build the structured memory context appended to the coach's system prompt. */
async function buildMemoryContext(
  userId: string,
  coachId: string
): Promise<string> {
  const [recentProgress, openTopics, recurringBlindSpots] = await Promise.all([
    db
      .select({
        decision: progressEntry.decision,
        lesson: progressEntry.lesson,
        createdAt: progressEntry.createdAt,
      })
      .from(progressEntry)
      .where(
        and(
          eq(progressEntry.userId, userId),
          eq(progressEntry.coachId, coachId)
        )
      )
      .orderBy(desc(progressEntry.createdAt))
      .limit(5),
    db
      .select({
        topic: openTopic.topic,
        reason: openTopic.reason,
      })
      .from(openTopic)
      .where(
        and(
          eq(openTopic.userId, userId),
          eq(openTopic.coachId, coachId),
          eq(openTopic.status, "open")
        )
      )
      .orderBy(desc(openTopic.createdAt))
      .limit(10),
    db
      .select({
        pattern: blindSpotPattern.pattern,
        occurrenceCount: blindSpotPattern.occurrenceCount,
      })
      .from(blindSpotPattern)
      .where(
        and(
          eq(blindSpotPattern.userId, userId),
          eq(blindSpotPattern.coachId, coachId)
        )
      )
      .orderBy(desc(blindSpotPattern.occurrenceCount))
      .limit(10),
  ]);

  const sections: string[] = [];

  if (recentProgress.length > 0) {
    sections.push(
      "Recent progress entries for this person:\n" +
        recentProgress
          .map(
            (entry) =>
              `- ${entry.createdAt.toISOString().slice(0, 10)}: ${entry.decision ?? "(no decision recorded)"}${entry.lesson ? ` — lesson: ${entry.lesson}` : ""}`
          )
          .join("\n")
    );
  }

  if (openTopics.length > 0) {
    sections.push(
      "Open topics still unresolved from previous sessions:\n" +
        openTopics
          .map((t) => `- ${t.topic}${t.reason ? ` (${t.reason})` : ""}`)
          .join("\n")
    );
  }

  const persistentBlindSpots = recurringBlindSpots.filter(
    (b) => b.occurrenceCount >= 3
  );
  if (persistentBlindSpots.length > 0) {
    sections.push(
      "Recurring blind spots (seen 3+ times, call these out directly per the rule of 3):\n" +
        persistentBlindSpots
          .map((b) => `- ${b.pattern} (seen ${b.occurrenceCount}x)`)
          .join("\n")
    );
  }

  if (sections.length === 0) return "";

  return `\n\n---\n\nContext from this person's coaching history:\n\n${sections.join("\n\n")}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ coachId: string; sessionId: string }> }
) {
  const limited = await applyRateLimit("coach-chat", RATE_LIMITS.coachChat);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError("Not found", 404);
  }
  const { coachId, sessionId } = parsedParams.data;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [existingSession] = await db
    .select({
      id: coachingSession.id,
      userId: coachingSession.userId,
      coachId: coachingSession.coachId,
      title: coachingSession.title,
    })
    .from(coachingSession)
    .where(eq(coachingSession.id, sessionId))
    .limit(1);

  if (
    !existingSession ||
    existingSession.userId !== session.user.id ||
    existingSession.coachId !== coachId
  ) {
    return apiError("Not found", 404);
  }

  const isFirstUserMessage = existingSession.title === null;

  const coach = getCoach(coachId);
  const memoryContext = await buildMemoryContext(session.user.id, coachId);

  const [priorMessages] = await Promise.all([
    db
      .select({
        role: coachingMessage.role,
        content: coachingMessage.content,
      })
      .from(coachingMessage)
      .where(eq(coachingMessage.sessionId, sessionId))
      .orderBy(asc(coachingMessage.createdAt))
      .limit(50),
  ]);

  await db.insert(coachingMessage).values({
    sessionId,
    role: "user",
    content: data.content,
  });

  // Fire-and-forget title generation for a brand-new session.
  if (isFirstUserMessage) {
    void generateTitle(sessionId, data.content);
  }

  if (looksLikeWrapUp(data.content)) {
    void maybeExtractMemory(sessionId);
  }

  const result = streamText({
    model: getModel("chat"),
    system: `${coach.systemPrompt}${memoryContext}`,
    messages: [
      ...priorMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: data.content },
    ],
    onFinish: async ({ text }) => {
      if (text.trim().length === 0) return;
      await db.insert(coachingMessage).values({
        sessionId,
        role: "assistant",
        content: text,
      });
      await db
        .update(coachingSession)
        .set({ updatedAt: new Date() })
        .where(eq(coachingSession.id, sessionId));
    },
  });

  return result.toTextStreamResponse();
}

async function generateTitle(sessionId: string, firstMessage: string) {
  try {
    const result = streamText({
      model: getModel("title"),
      system:
        "Summarize the user's opening message as a short 4-6 word session title, in the same language as the message. Reply with only the title, no quotes, no punctuation at the end.",
      prompt: firstMessage,
    });
    const title = (await result.text).trim().slice(0, 120);
    if (title) {
      await db
        .update(coachingSession)
        .set({ title })
        .where(eq(coachingSession.id, sessionId));
    }
  } catch {
    // Title generation is best-effort; a missing title just falls back to
    // the session's default UI label.
  }
}
