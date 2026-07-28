import { z } from "zod";
import { asc, eq, or } from "drizzle-orm";
import { streamText } from "ai";
import { apiError, requireApiAuth, parseBody } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { coachingSession, coachingMessage, realCase, advisorProfile } from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";
import { getExtraAdvisors } from "@/lib/coaches/board-experts";
import { getModel } from "@/lib/ai/models";
import { buildBusinessContext } from "@/lib/coaches/business-context";

const paramsSchema = z.object({
  coachId: z.string().refine(isCoachId, { message: "Coach sconosciuto" }),
  sessionId: z.string().uuid(),
});

const bodySchema = z.object({
  problem: z.string().trim().min(1).max(20000),
  advisorIds: z.array(z.string()).min(1).max(10),
});

/**
 * A message stored with this prefix is a synthesized Advisory Board
 * response rather than a normal coach turn. Stripped by the UI before
 * rendering, used to pick the visually distinct treatment.
 */
export const BOARD_MESSAGE_PREFIX = "[[board]]\n";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ coachId: string; sessionId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return apiError("Non trovato", 404);
  }
  const { coachId, sessionId } = parsedParams.data;

  const { data, error: bodyError } = await parseBody(req, bodySchema);
  if (bodyError) return bodyError;

  const [existingSession] = await db
    .select({
      id: coachingSession.id,
      userId: coachingSession.userId,
      coachId: coachingSession.coachId,
    })
    .from(coachingSession)
    .where(eq(coachingSession.id, sessionId))
    .limit(1);

  if (
    !existingSession ||
    existingSession.userId !== session.user.id ||
    existingSession.coachId !== coachId
  ) {
    return apiError("Non trovato", 404);
  }

  const coach = getCoach(coachId);

  const dbAdvisors = await db
    .select({
      id: advisorProfile.id,
      name: advisorProfile.name,
      whatTheyThink: advisorProfile.whatTheyThink,
      howTheyDecide: advisorProfile.howTheyDecide,
    })
    .from(advisorProfile)
    .where(
      or(
        eq(advisorProfile.ownerUserId, session.user.id),
        eq(advisorProfile.isShared, true)
      )
    )
    .limit(50);

  const extraAdvisors = await getExtraAdvisors(coachId);

  const selectedStatic = coach.advisoryBoard.filter((a) =>
    data.advisorIds.includes(a.id)
  );
  const selectedDb = dbAdvisors.filter((a) => data.advisorIds.includes(a.id));
  const selectedExtra = extraAdvisors.filter((a) =>
    data.advisorIds.includes(a.id)
  );

  if (
    selectedStatic.length === 0 &&
    selectedDb.length === 0 &&
    selectedExtra.length === 0
  ) {
    return apiError("Nessun advisor valido selezionato", 400);
  }

  const advisorBriefs = [
    ...selectedStatic.map(
      (a) => `## ${a.name}\nLente: ${a.lens}\nStile: ${a.style}`
    ),
    ...selectedExtra.map(
      (a) => `## ${a.name}\nLente: ${a.lens}\nStile: ${a.style}`
    ),
    ...selectedDb.map(
      (a) =>
        `## ${a.name}\nCosa pensa: ${a.whatTheyThink ?? "(non specificato)"}\nCome decide: ${a.howTheyDecide ?? "(non specificato)"}`
    ),
  ].join("\n\n");

  const consultSystemPrompt = `${coach.systemPrompt}

---

## MODALITÀ ADVisory board (binario B, consulenza su caso reale)

L'utente ha convocato un Advisory Board per un caso reale. Rispondi impersonando in sequenza ciascuno degli advisor selezionati sotto, restando fedele alla loro lente e al loro stile, poi chiudi con una sintesi tua (del coach) che integra i punti di vista in una raccomandazione concreta. Ogni advisor prende una posizione chiara, anche in disaccordo con gli altri: non appiattire le voci in un consenso finto.

Advisor convocati:

${advisorBriefs}`;

  const priorMessages = await db
    .select({ role: coachingMessage.role, content: coachingMessage.content })
    .from(coachingMessage)
    .where(eq(coachingMessage.sessionId, sessionId))
    .orderBy(asc(coachingMessage.createdAt))
    .limit(50);

  await db.insert(coachingMessage).values({
    sessionId,
    role: "user",
    content: data.problem,
  });

  const advisorNames = [...selectedStatic, ...selectedExtra, ...selectedDb].map(
    (a) => a.name
  );
  const businessContext = await buildBusinessContext(session.user.id, coachId);

  const result = streamText({
    model: getModel("board"),
    system: `${consultSystemPrompt}${businessContext}`,
    messages: [
      ...priorMessages
        .filter((m) => !m.content.startsWith(BOARD_MESSAGE_PREFIX))
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      { role: "user" as const, content: data.problem },
    ],
    onFinish: async ({ text }) => {
      if (text.trim().length === 0) return;
      await db.insert(coachingMessage).values({
        sessionId,
        role: "assistant",
        content: `${BOARD_MESSAGE_PREFIX}${text}`,
      });
      await db
        .update(coachingSession)
        .set({ updatedAt: new Date(), track: "consulting" })
        .where(eq(coachingSession.id, sessionId));
      await db.insert(realCase).values({
        userId: session.user.id,
        coachId,
        problem: data.problem.slice(0, 4000),
        advisorsConsulted: advisorNames,
        advice: text.slice(0, 8000),
      });
    },
  });

  return result.toTextStreamResponse();
}
