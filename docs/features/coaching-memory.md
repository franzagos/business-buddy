# Coaching Memory

## What It Does
Structured, database-backed memory that replaces the source system's Markdown files. It tracks a user's progress per coach across sessions: rubric-scored progress entries, open topics still being worked on, and recurring "blind-spot" patterns (the source system's "rule of 3" — a pattern seen 3+ times becomes the deliberate target of the next case). It also logs real-case consultations against the Advisory Board, and lets each user maintain their own personal advisor profile (plus a single shared "Franz" voice available to everyone).

## Data Model
### New Tables
- `progress_entry` — `id`, `userId` (FK user, cascade), `coachId`, `sessionId` (FK coaching_session, nullable), `register`, `decision`, `blindSpots` (jsonb array of `{label, category}`), `scores` (jsonb array of `{dimension, score, note}`), `lesson`, `createdAt`. Indexed on `userId`, `coachId`.
- `open_topic` — `id`, `userId` (FK user, cascade), `coachId`, `topic`, `reason`, `howToTest`, `status` (`open`/`closed`, default `open`), `closedAt`, `createdAt`. Indexed on `userId`, `coachId`.
- `blind_spot_pattern` — `id`, `userId` (FK user, cascade), `coachId`, `pattern`, `occurrenceCount` (default 1), `lastSeenAt`, `createdAt`. Indexed on `userId`, `coachId`; unique on `(userId, coachId, pattern)`.
- `real_case` — `id`, `userId` (FK user, cascade), `coachId`, `problem`, `advisorsConsulted` (jsonb), `advice`, `actionsDecided`, `createdAt`. Indexed on `userId`, `coachId`.
- `advisor_profile` — `id`, `ownerUserId` (FK user, cascade), `name`, `whatTheyThink`, `howTheyDecide`, `isShared` (default false), `createdAt`, `updatedAt`. Indexed on `ownerUserId`. Advisory board queries select `ownerUserId = currentUser OR isShared = true`.

### Modified Tables
None.

## API Routes
- `PATCH /api/open-topics/[id]` — updates an open topic's status (open ↔ closed), scoped to the owning user.
- `GET /api/advisor-profile` — returns the current user's personal advisor profile (or `null`).
- `PUT /api/advisor-profile` — creates/updates the current user's personal advisor profile (`whatTheyThink` / `howTheyDecide`).
- Memory writes themselves are not a standalone route — they happen as a side effect of `POST /api/coaches/[coachId]/sessions/[sessionId]/messages` (wrap-up keyword heuristic) and `POST /api/coaches/[coachId]/sessions/[sessionId]/end` (explicit end), both in `coaching-chat`.

## Key Files
- `src/lib/coaches/memory.ts` — `extractMemory(sessionId)`: loads the full session transcript, calls the memory-extraction model (structured JSON extraction), and upserts `progress_entry` (insert), `open_topic` (insert), and `blind_spot_pattern` rows (insert or increment `occurrenceCount`/`lastSeenAt` on repeat). Best-effort and fault-tolerant — any parse/model failure is caught and logged, never breaks the calling request. Also exports `maybeExtractMemory`, the fire-and-forget wrap-up trigger used by the chat route.
- `src/lib/ai/models.ts` — `getModel("memory")` resolves to `OPENROUTER_MODEL_MEMORY` (cheap model, structured extraction doesn't need frontier reasoning).
- `src/app/(app)/coaches/[coachId]/progress/page.tsx` — progress page: past progress entries with rubric score deltas, open topics list (open/closed toggle), blind-spot patterns with occurrence counts.
- `src/components/progress/open-topic-toggle.tsx` — open/closed toggle UI calling `PATCH /api/open-topics/[id]`.
- `src/app/(app)/settings/advisor-profile/page.tsx` — personal advisor profile form page.
- `src/components/settings/advisor-profile-form.tsx` — the two-textarea form ("what I think" / "how I decide").
- `scripts/seed-franz.ts` — seeds the shared `advisor_profile` row (`isShared = true`) for the `OWNER_EMAIL` account, ported from `Franz-Consulente.md` + `Cosa Pensa Franz.md`. No-op and re-runnable if the owner account doesn't exist yet.

## Environment Variables
- `OPENROUTER_MODEL_MEMORY` (default `openai/gpt-4.1-mini`) — memory extraction/summarization model.
- `OWNER_EMAIL` — the account that owns the shared "Franz" advisor profile; used by `pnpm run db:seed`.

## Notes for Future Development
- `real_case` rows are written from the advisory-board consulting flow (`coaching-chat`'s `/consult` route) — kept separate from training-session `progress_entry` rows, matching the source system's `Casi-reali.md` split.
- Memory extraction is triggered by a simple keyword heuristic ("salva", "chiudiamo", "abbiamo finito") on each user message, not a dedicated endpoint — check `src/lib/coaches/memory.ts` and the messages route in `coaching-chat` together when changing wrap-up behavior.
- The `blind_spot_pattern` unique constraint is `(userId, coachId, pattern)` — the extraction model is asked to phrase patterns consistently so they actually collide and increment rather than fork into near-duplicate rows; this is prompt-engineering, not enforced by the schema.
