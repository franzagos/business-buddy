# Coaching Chat

## What It Does
Streaming chat interface with three AI business coaches — Executive, Agency, and Startup — each with a persona, style rules, and case-based coaching flow ported verbatim from the original Claude Skills system (`Business Coach/` at the project root). Each coach has its own advisory board of expert personas that can be consulted mid-session for real-case advice. Every coach turn is checked against a shared writing-quality gate (no em dash, no "Recap:" blocks, no formulaic phrasing) baked into the system prompt.

## Data Model
### New Tables
- `coaching_session` — `id`, `userId` (FK user, cascade), `coachId` (`executive`/`agency`/`startup`), `title`, `track` (`training`/`consulting`), `register` (`wartime`/`peacetime`), `createdAt`, `updatedAt`. Indexed on `userId`, `coachId`, and `(userId, coachId, updatedAt)`.
- `coaching_message` — `id`, `sessionId` (FK coaching_session, cascade), `role` (`user`/`assistant`), `content`, `createdAt`. Indexed on `sessionId` and `(sessionId, createdAt)`.

### Modified Tables
None.

## API Routes
- `GET /api/coaches/[coachId]/sessions` — lists the current user's sessions for a coach (paginated, most recent first).
- `POST /api/coaches/[coachId]/sessions` — creates a new session for a coach, seeded with the coach's welcome message.
- `POST /api/coaches/[coachId]/sessions/[sessionId]/messages` — sends a user message, streams the coach's reply (AI SDK + OpenRouter), persists both messages, and fires the memory-extraction wrap-up heuristic (see `coaching-memory`). Rate-limited via `RATE_LIMITS.coachChat` (40 messages/day/user).
- `POST /api/coaches/[coachId]/sessions/[sessionId]/end` — explicitly ends a session ("End session & save progress"), triggering memory extraction.
- `POST /api/coaches/[coachId]/sessions/[sessionId]/consult` — advisory board consultation turn for the real-case consulting track; builds a prompt from the requested advisor profiles (fixed roster + shared Franz voice + personal profiles) and returns synthesized advice.

## Key Files
- `src/lib/coaches/index.ts` — `getCoach(coachId)` assembles a coach's system prompt (persona + writing-quality gate), advisory board, rubric, and welcome message.
- `src/lib/coaches/{executive,agency,startup}/persona.ts` — per-coach system prompt and welcome message, ported from the source `SKILL.md` files.
- `src/lib/coaches/{executive,agency,startup}/advisory-board.ts` — per-coach expert roster (Munger, Bezos, Horowitz, Annie Duke, Paul Graham, etc.).
- `src/lib/coaches/{executive,agency,startup}/rubric.ts` — per-coach evaluation dimensions used for session scoring.
- `src/lib/coaches/shared/writing-quality-gate.ts` — shared anti-AI-writing-tell instructions appended to every coach's system prompt.
- `src/lib/ai/models.ts` — `getModel(fn)` selects the OpenRouter model per function (`chat`, `board`, `memory`, `title`).
- `src/app/(app)/coaches/[coachId]/page.tsx` — coach landing/overview page.
- `src/app/(app)/coaches/[coachId]/sessions/[sessionId]/page.tsx` — chat transcript page (sidebar + streaming transcript, max-w-3xl).
- `src/components/chat/chat-transcript.tsx` — streaming, Markdown-rendered transcript UI.
- `src/components/chat/new-session-button.tsx` — starts a new session for a coach.
- `src/lib/rate-limit.ts` — `RATE_LIMITS.coachChat` entry (40 msgs/day/user).

## Environment Variables
- `OPENROUTER_API_KEY` — required for any AI call.
- `OPENROUTER_MODEL_CHAT` (default `anthropic/claude-sonnet-4.5`) — coach chat + advisory board turns.
- `OPENROUTER_MODEL_BOARD` (default `anthropic/claude-sonnet-4.5`) — advisory board synthesis.

## Notes for Future Development
- Coach content (persona, advisory board, rubric) is static, versioned code under `src/lib/coaches/`, not database rows — editing a coach's voice means editing these files, not running a migration.
- The running system prompt for a session is rebuilt on each turn from the coach persona plus the user's current memory state (progress entries, open topics, blind-spot patterns with `occurrenceCount >= 3`) — see `coaching-memory` for that assembly logic.
- Session titles are auto-generated from the first user message via the `title` model function; sessions are user-editable but that isn't a distinct API route today (title is set at creation).
