/**
 * One-time backfill for sessions created before the Allenamento/Coaching
 * track split (coaching_session.track was still always null). Classifies
 * each untracked session's opening exchange with the cheap memory model and
 * writes the result back, so old sessions surface under the correct
 * sidebar/hub sub-section instead of the legacy "Altre sessioni" bucket.
 *
 * Safe to re-run: only touches rows where `track IS NULL`. Rows the model
 * can't confidently classify are left null (visible in "Altre sessioni").
 */
import { asc, eq, isNull } from "drizzle-orm";
import { generateText } from "ai";
import { db } from "../src/lib/db";
import { coachingSession, coachingMessage } from "../src/lib/schema";
import { getModel } from "../src/lib/ai/models";
import type { SessionTrack } from "../src/lib/coaches/track";

const CLASSIFY_PROMPT = `Classifica questa conversazione di coaching aziendale in una di due categorie:

"training" — l'utente si sta allenando su un caso costruito dal coach (fittizio, con poste alte, per esercitarsi), oppure ha chiesto esplicitamente di allenarsi / fare un caso / essere messo alla prova.
"consulting" — l'utente sta portando un problema reale della propria azienda, chiede un parere su una situazione vera, o convoca un Advisory Board su un caso reale.

Rispondi con una sola parola, esattamente: training oppure consulting. Se il messaggio di benvenuto generico del coach è l'unico contenuto (nessun messaggio dell'utente ancora sostanziale), rispondi: unclear.`;

function parseClassification(raw: string): SessionTrack | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized.startsWith("training")) return "training";
  if (normalized.startsWith("consulting")) return "consulting";
  return null;
}

async function main() {
  const untracked = await db
    .select({ id: coachingSession.id })
    .from(coachingSession)
    .where(isNull(coachingSession.track))
    .limit(500);

  if (untracked.length === 0) {
    console.log("[backfill-session-tracks] Nothing to backfill — no untracked sessions.");
    process.exit(0);
  }

  console.log(`[backfill-session-tracks] Classifying ${untracked.length} session(s)...`);

  let training = 0;
  let consulting = 0;
  let unclear = 0;
  let failed = 0;

  for (const { id } of untracked) {
    try {
      const messages = await db
        .select({ role: coachingMessage.role, content: coachingMessage.content })
        .from(coachingMessage)
        .where(eq(coachingMessage.sessionId, id))
        .orderBy(asc(coachingMessage.createdAt))
        .limit(6);

      const transcript = messages
        .map((m) => `${m.role === "user" ? "UTENTE" : "COACH"}: ${m.content}`)
        .join("\n\n")
        .slice(0, 6000);

      const { text } = await generateText({
        model: getModel("memory"),
        system: CLASSIFY_PROMPT,
        prompt: transcript || "(nessun messaggio)",
      });

      const track = parseClassification(text);
      if (!track) {
        unclear++;
        continue;
      }

      await db
        .update(coachingSession)
        .set({ track })
        .where(eq(coachingSession.id, id));

      if (track === "training") training++;
      else consulting++;
    } catch (err) {
      failed++;
      console.error(`[backfill-session-tracks] Failed to classify session ${id}:`, err);
    }
  }

  console.log(
    `[backfill-session-tracks] Done. training=${training} consulting=${consulting} unclear=${unclear} failed=${failed}`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("[backfill-session-tracks] Fatal error:", error);
  process.exit(1);
});
