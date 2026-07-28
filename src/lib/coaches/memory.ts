import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { generateText } from "ai";
import { db } from "@/lib/db";
import {
  coachingSession,
  coachingMessage,
  progressEntry,
  openTopic,
  blindSpotPattern,
} from "@/lib/schema";
import { getModel } from "@/lib/ai/models";
import { getCoach, isCoachId } from "@/lib/coaches";

/**
 * Structured-extraction schema for the memory model's output. Every field is
 * optional/nullable — the model is asked for JSON but its output is only
 * ever a best-effort hint, never trusted blindly.
 */
const scoreSchema = z.object({
  dimension: z.string(),
  score: z.number(),
  note: z.string().optional().nullable(),
});

const blindSpotEntrySchema = z.object({
  label: z.string(),
  category: z.string().optional().nullable(),
});

const extractionSchema = z.object({
  progressEntry: z
    .object({
      decision: z.string().optional().nullable(),
      lesson: z.string().optional().nullable(),
      register: z.string().optional().nullable(),
      scores: z.array(scoreSchema).optional().nullable(),
      blindSpots: z.array(blindSpotEntrySchema).optional().nullable(),
    })
    .optional()
    .nullable(),
  openTopics: z
    .array(
      z.object({
        topic: z.string(),
        reason: z.string().optional().nullable(),
        howToTest: z.string().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
  blindSpots: z
    .array(z.object({ pattern: z.string() }))
    .optional()
    .nullable(),
});

type Extraction = z.infer<typeof extractionSchema>;

/**
 * Built per-coach so the model picks `dimension` from the coach's ACTUAL
 * rubric ids (src/lib/coaches/*\/rubric.ts) instead of inventing its own
 * kebab-case label — otherwise scores never match the rubric the UI reads
 * from, and every dimension-based view (progress badges, personal
 * analytics) silently has nothing to show.
 */
function buildExtractionPrompt(coachId: string): string {
  const rubricList = isCoachId(coachId)
    ? getCoach(coachId)
        .rubric.map((r) => `- "${r.id}" — ${r.label}`)
        .join("\n")
    : "";

  return `Sei un modulo di estrazione strutturata per una piattaforma di coaching aziendale. Ricevi il transcript completo di una sessione di coaching tra un utente e un coach AI. Il tuo compito è estrarre in formato JSON, e solo JSON, senza testo aggiuntivo, senza markdown fences, i seguenti dati:

{
  "progressEntry": {
    "decision": "la decisione principale presa o discussa nella sessione, in una frase, oppure null se non c'è una decisione chiara",
    "lesson": "la lezione o l'insight principale emerso, oppure null",
    "register": "wartime oppure peacetime, in base al tono della sessione, oppure null",
    "scores": [ { "dimension": "usa SOLO uno degli id esatti elencati sotto, mai un id inventato", "score": numero da 1 a 10, "note": "breve motivazione" } ],
    "blindSpots": [ { "label": "punto cieco individuato in questa sessione", "category": "categoria breve" } ]
  } oppure null se la sessione non contiene abbastanza contenuto per un progress entry,
  "openTopics": [ { "topic": "argomento rimasto aperto da approfondire in futuro", "reason": "perché è rilevante", "howToTest": "come verificarlo o affrontarlo" } ],
  "blindSpots": [ { "pattern": "descrizione sintetica e riutilizzabile di uno schema ricorrente di punto cieco, in modo che possa essere confrontato nel tempo con altre sessioni" } ]
}

Dimensioni valide per "scores.dimension" (usa esattamente questi id, non tradurli, non inventarne altri, ometti una dimensione se non è pertinente a questa sessione invece di forzarla):
${rubricList}

Se la sessione è troppo breve o non contiene contenuto sostanziale (es. solo il messaggio di benvenuto), rispondi con { "progressEntry": null, "openTopics": [], "blindSpots": [] }.
Rispondi SOLO con il JSON, nessun altro testo.`;
}

function extractJson(raw: string): unknown | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

/**
 * Loads the full transcript for a session, asks the memory model for a
 * structured extraction, and persists the result:
 * - a `progress_entry` row if one was extracted
 * - new `open_topic` rows (status "open")
 * - `blind_spot_pattern` rows upserted by (userId, coachId, pattern),
 *   incrementing `occurrenceCount` / `lastSeenAt` when a pattern repeats
 *
 * Tolerant by design: any parsing/model failure is swallowed (logged to
 * console) so a failed extraction never breaks the calling request.
 */
export type ProgressEntryRow = typeof progressEntry.$inferSelect;

export async function extractMemory(
  sessionId: string
): Promise<ProgressEntryRow | null> {
  try {
    const [sessionRow] = await db
      .select({
        id: coachingSession.id,
        userId: coachingSession.userId,
        coachId: coachingSession.coachId,
      })
      .from(coachingSession)
      .where(eq(coachingSession.id, sessionId))
      .limit(1);

    if (!sessionRow) return null;

    const messages = await db
      .select({
        role: coachingMessage.role,
        content: coachingMessage.content,
      })
      .from(coachingMessage)
      .where(eq(coachingMessage.sessionId, sessionId))
      .orderBy(asc(coachingMessage.createdAt))
      .limit(200);

    // Not enough content to extract anything meaningful.
    if (messages.filter((m) => m.role === "user").length === 0) return null;

    const transcript = messages
      .map((m) => `${m.role === "user" ? "UTENTE" : "COACH"}: ${m.content}`)
      .join("\n\n");

    const { text } = await generateText({
      model: getModel("memory"),
      system: buildExtractionPrompt(sessionRow.coachId),
      prompt: transcript.slice(0, 24000),
    });

    const json = extractJson(text);
    if (json === null) return null;

    const parsed = extractionSchema.safeParse(json);
    if (!parsed.success) return null;

    const extraction: Extraction = parsed.data;
    const { userId, coachId } = sessionRow;

    let insertedEntry: ProgressEntryRow | null = null;
    if (extraction.progressEntry) {
      const pe = extraction.progressEntry;
      const [row] = await db
        .insert(progressEntry)
        .values({
          userId,
          coachId,
          sessionId,
          register: pe.register ?? null,
          decision: pe.decision ?? null,
          blindSpots: pe.blindSpots ?? null,
          scores: pe.scores ?? null,
          lesson: pe.lesson ?? null,
        })
        .returning();
      insertedEntry = row;
    }

    if (extraction.openTopics && extraction.openTopics.length > 0) {
      await db.insert(openTopic).values(
        extraction.openTopics.map((t) => ({
          userId,
          coachId,
          sessionId,
          topic: t.topic,
          reason: t.reason ?? null,
          howToTest: t.howToTest ?? null,
        }))
      );
    }

    if (extraction.blindSpots && extraction.blindSpots.length > 0) {
      for (const spot of extraction.blindSpots) {
        const [existing] = await db
          .select({
            id: blindSpotPattern.id,
            occurrenceCount: blindSpotPattern.occurrenceCount,
          })
          .from(blindSpotPattern)
          .where(
            and(
              eq(blindSpotPattern.userId, userId),
              eq(blindSpotPattern.coachId, coachId),
              eq(blindSpotPattern.pattern, spot.pattern)
            )
          )
          .limit(1);

        if (existing) {
          await db
            .update(blindSpotPattern)
            .set({
              occurrenceCount: existing.occurrenceCount + 1,
              lastSeenAt: new Date(),
            })
            .where(eq(blindSpotPattern.id, existing.id));
        } else {
          await db.insert(blindSpotPattern).values({
            userId,
            coachId,
            pattern: spot.pattern,
            occurrenceCount: 1,
            lastSeenAt: new Date(),
          });
        }
      }
    }

    return insertedEntry;
  } catch (err) {
    // Memory extraction is best-effort — never let it break the caller
    // (a chat turn or the explicit "end session" action).
    console.error("extractMemory failed", { sessionId, err });
    return null;
  }
}

/**
 * Wrap-up trigger used by the chat messages route: fires memory extraction
 * when a simple keyword heuristic detects the user wants to save/close out.
 * Fire-and-forget from the caller's perspective.
 */
export async function maybeExtractMemory(sessionId: string): Promise<void> {
  await extractMemory(sessionId);
}
