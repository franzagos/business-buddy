# Implementation Plan

## Phase 1 — Foundations [feature: coaching-foundations]

### Files to Read
- `env.example`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/lib/schema.ts`
- `src/lib/rate-limit.ts`
- `src/lib/env.ts`
- `DESIGN.md`
- `specs/coaching-platform/decisions.md`
- `Business Coach/executive-coach-system/SKILL.md`, `Advisory-Board.md`, `Rubrica-valutazione.md`, `Franz-Consulente.md`, `Cosa Pensa Franz.md`
- `Business Coach/agency-coach-system/SKILL.md`, `Advisory-Board.md`, `Rubrica-valutazione.md`
- `Business Coach/startup-coach-system/SKILL.md`, `Advisory-Board.md`, `Rubrica-valutazione.md`
- `Business Coach/Anti LLM Agent/SKILL.md` and its `references/` folder
- `package.json`

### Technical Details
- Add env vars to `env.example` (not `.env`, which is git-ignored and user-owned): `OPENROUTER_MODEL_CHAT` (default `anthropic/claude-sonnet-4.5`), `OPENROUTER_MODEL_BOARD` (default `anthropic/claude-sonnet-4.5`), `OPENROUTER_MODEL_MEMORY` (default `openai/gpt-4.1-mini`), `OPENROUTER_MODEL_TITLE` (default `openai/gpt-4.1-mini`), `OWNER_EMAIL` (empty default, comment explaining it's used to seed the shared Franz advisor profile).
- Update `src/app/globals.css` `@theme` block: replace/extend the existing color tokens with the light/dark palette described in `DESIGN.md`'s "Color story" section. Keep existing token names used elsewhere in the app (`--background`, `--foreground`, `--primary`, `--muted`, etc. per shadcn conventions) but set their values to the Loop palette. Add `--font-display` (Poppins), `--font-body` (Inter), `--font-mono-data` (JetBrains Mono) CSS variables wired to the fonts loaded in `layout.tsx`.
- `src/app/layout.tsx`: load Poppins (weights 500/600/700/800), Inter (400/500/600/700), JetBrains Mono (500/600) via `next/font/google`, expose as CSS variables, apply Inter as the default body font at the `<html>` or `<body>` level.
- Add the six new tables from `specs/coaching-platform/decisions.md`'s "Database schema additions" section to `src/lib/schema.ts`, following the file's existing conventions (indexes on FK columns, `pgTable` style matching `user`/`session` tables). Then run `pnpm run db:generate` followed by `pnpm run db:migrate`.
- Create `src/lib/ai/models.ts`: export `getModel(fn: "chat" | "board" | "memory" | "title")` that reads the corresponding env var (falling back to the defaults above) and returns an OpenRouter model instance via `createOpenRouter` from `@openrouter/ai-sdk-provider`, matching the pattern already described in `AGENTS.md`'s rule #3.
- Add `coachChat` to the `RATE_LIMITS` export in `src/lib/rate-limit.ts`: 40 requests per user per 24h window, following the existing shape of other entries in that file.
- Create `src/lib/coaches/executive/persona.ts`, `src/lib/coaches/agency/persona.ts`, `src/lib/coaches/startup/persona.ts`: each exports a `SYSTEM_PROMPT` string built by porting the full persona/style-rules/case-method/consulting-flow content from the corresponding `Business Coach/*-system/SKILL.md`, adapted so file references (e.g. `Rubrica-valutazione.md`, `Temi-aperti.md`) become instructions to use the structured data passed into the prompt (progress entries, open topics, blind-spot patterns) instead of reading files. Preserve the coaching logic and tone faithfully — this is prompt content, translate mechanically, don't rewrite the coaching methodology.
- Create `src/lib/coaches/executive/advisory-board.ts`, `.../agency/advisory-board.ts`, `.../startup/advisory-board.ts`: export a typed `AdvisorRoster` array `{ id, name, lens, style }[]` ported from each coach's `Advisory-Board.md` (excluding the Franz entry, which comes from the database instead — see Phase 3).
- Create `src/lib/coaches/executive/rubric.ts` etc.: export a typed `RubricDimension[]` (`{ id, label, icon }`) ported from each coach's `Rubrica-valutazione.md`.
- Create `src/lib/coaches/shared/writing-quality-gate.ts`: export a `WRITING_QUALITY_GATE` string ported from `Business Coach/Anti LLM Agent/SKILL.md` + `references/pattern-anti-llm.md`, written as a prompt fragment (not file-reading instructions). Append it to every coach's `SYSTEM_PROMPT` when assembling the final system prompt (do this in `src/lib/coaches/index.ts`, a small barrel file exporting `getCoach(coachId)` → `{ systemPrompt, advisoryBoard, rubric, welcomeMessage }`, where `systemPrompt` already includes the writing-quality gate appended).
- Port each coach's "BENVENUTO" welcome message (from its SKILL.md) into a `WELCOME_MESSAGE` string per coach, exported alongside `SYSTEM_PROMPT`.
- Create `scripts/seed-franz.ts` (tsx script, following the pattern of other scripts if any exist, otherwise a standalone script using `src/lib/db.ts` and `src/lib/schema.ts` directly): looks up the user row by `process.env.OWNER_EMAIL`, and if found, upserts an `advisor_profile` row with `isShared = true`, `name = "Franz"`, `whatTheyThink` and `howTheyDecide` ported from `Business Coach/executive-coach-system/Cosa Pensa Franz.md` and `Franz-Consulente.md`. If no user matches, log a clear message and exit 0 (no-op, not an error). Add `"db:seed": "tsx scripts/seed-franz.ts"` to `package.json` scripts.

- [x] [wave:1] Add env var entries to `env.example`
- [x] [wave:1] Update `src/app/globals.css` theme tokens for light/dark Loop palette
- [x] [wave:1] Load Poppins/Inter/JetBrains Mono fonts in `src/app/layout.tsx`
- [x] [wave:2] Add new schema tables to `src/lib/schema.ts` and run db:generate + db:migrate
- [x] [wave:2] Create `src/lib/ai/models.ts`
- [x] [wave:2] Add `RATE_LIMITS.coachChat` to `src/lib/rate-limit.ts`
- [x] [wave:2] Port coach personas, advisory boards, rubrics, welcome messages, and the shared writing-quality gate into `src/lib/coaches/`
- [x] [wave:3] Write `scripts/seed-franz.ts` and add `db:seed` script

## Phase 2 — Chat core [feature: coaching-chat]

### Files to Read
- `src/lib/api-utils.ts`
- `src/lib/session.ts`
- `src/lib/schema.ts`
- `src/lib/coaches/index.ts` (from Phase 1)
- `src/lib/ai/models.ts` (from Phase 1)
- `src/components/ui/*` (existing shadcn components)
- `src/app/dashboard/*` (current placeholder, for reference on the app route group pattern)
- `DESIGN.md`
- `specs/coaching-platform/decisions.md`

### Technical Details
- `src/app/api/coaches/[coachId]/sessions/route.ts`: `GET` lists the current user's sessions for that coach (`.limit(50)`, ordered by `updatedAt desc`), `POST` creates a new session (validate `coachId` is one of `executive|agency|startup` with Zod), inserts a `coaching_session` row, inserts the coach's `WELCOME_MESSAGE` as the first `coaching_message` (role `assistant`), returns the new session. Auth via `requireApiAuth`, no rate limit on list, rate limit on create is not needed (rate limit applies to sending messages, see below).
- `src/app/api/coaches/[coachId]/sessions/[sessionId]/messages/route.ts`: `POST` — `applyRateLimit("coach-chat", RATE_LIMITS.coachChat)` keyed by user id, `requireApiAuth`, verify the session belongs to the current user, `parseBody` with Zod validating `{ content: string }`, insert the user message, build the system prompt (coach system prompt + recent `progress_entry`/open `open_topic`/`blind_spot_pattern` rows for this user+coach, formatted as structured context text), stream the assistant reply via the AI SDK (`streamText` or equivalent) using `getModel("chat")`, persist the full assistant response as a `coaching_message` row once streaming completes. Also detect a simple wrap-up heuristic on the user's message (keywords like "salviamo", "chiudiamo", "abbiamo finito", "save", "let's wrap up") and if matched, kick off the memory-extraction call from Phase 3 (import a `maybeExtractMemory(sessionId)` function — stub it in Phase 2 as a no-op export if Phase 3 hasn't run yet, Phase 3 will implement it for real).
- Session title: after the first user message is saved in a new session, call `getModel("title")` with a short prompt ("summarize this opening message as a 4-6 word session title") and update `coaching_session.title`. Do this inline in the messages route after persisting the user message, non-blocking-acceptable (can await it, latency is small).
- `src/app/(app)/coaches/[coachId]/page.tsx`: server component behind `requireAuth`, shows the coach's name/persona summary (short description, not the full system prompt) and a primary "Start new session" pill button, plus a list of the user's existing sessions for this coach with a "Continue" action per row. Empty state when no sessions exist yet.
- `src/app/(app)/coaches/[coachId]/sessions/[sessionId]/page.tsx`: server component fetching the session + its messages (verify ownership), renders a client chat component. Chat component: message list with Markdown rendering (`react-markdown`) for assistant messages, plain text for user messages, streaming via the AI SDK's `useChat`/`useCompletion` client hook pointed at the messages API route, input pinned to the bottom, loading state while a response streams, error state (including a clear rate-limit-exceeded message) if the API call fails.
- `src/components/app-shell/sidebar.tsx` + `src/app/(app)/layout.tsx`: introduce an `(app)` route group with a shared sidebar shell (per `DESIGN.md`'s "Layout personality" and the sidebar component conventions listed in `docs/business/starter-prompt.md`). Sidebar sections: "Coaches" (links to the three coach pages), session history grouped by coach (most recent few sessions per coach, "See all" if more), "Progress", "Account" (sign out). Collapsible to a drawer below the mobile breakpoint. This layout wraps all authenticated app routes going forward (coach pages, progress page, settings).

- [x] [wave:1] Sessions list/create API route
- [x] [wave:1] App shell layout + sidebar component
- [x] [wave:2] Chat messages API route (streaming + rate limit + memory-trigger stub)
- [x] [wave:2] Session title auto-generation
- [x] [wave:3] Coach landing page (`/coaches/[coachId]`)
- [x] [wave:3] Chat session page + client chat UI (`/coaches/[coachId]/sessions/[sessionId]`)

## Phase 3 — Memory & progress [feature: coaching-memory]

### Files to Read
- `src/lib/schema.ts`
- `src/lib/ai/models.ts`
- `src/lib/coaches/index.ts`
- `src/app/api/coaches/[coachId]/sessions/[sessionId]/messages/route.ts` (the `maybeExtractMemory` stub from Phase 2)
- `src/lib/api-utils.ts`
- `DESIGN.md`
- `specs/coaching-platform/decisions.md`

### Technical Details
- Implement `src/lib/coaches/memory.ts` exporting `extractMemory(sessionId: string)`: loads the full message transcript for the session, calls `getModel("memory")` with a structured-extraction prompt (ask for JSON: `{ progressEntry: {...} | null, openTopics: [...], blindSpots: [...] }`), parses the result (Zod-validate the model's JSON output, tolerate a null/empty result gracefully), then: inserts a `progress_entry` row if one was extracted; upserts `open_topic` rows (new ones as `open`, matches on similar topic text can be skipped — keep it simple, just insert new rows, closing is a manual user action); for each blind spot, upsert `blind_spot_pattern` by `(userId, coachId, pattern)` — increment `occurrenceCount` and update `lastSeenAt` if it exists, insert with `occurrenceCount = 1` otherwise. Wire this into the Phase 2 `maybeExtractMemory` stub (replace the no-op with a real call to `extractMemory`).
- Add an explicit "End session & save progress" action: a small API route `src/app/api/coaches/[coachId]/sessions/[sessionId]/end/route.ts` (`POST`, auth + ownership check) that calls `extractMemory(sessionId)` directly, and a button in the chat UI (Phase 2's chat component) that calls it and shows a toast confirmation.
- `src/app/(app)/coaches/[coachId]/progress/page.tsx`: server component, `.limit(50)` queries for `progress_entry` (ordered by `createdAt desc`) and `open_topic` (open first, then closed) and `blind_spot_pattern` (ordered by `occurrenceCount desc`) for the current user + this coach. Render: progress entries as a list of cards (date, decision, rubric scores using the coach's `RubricDimension[]` labels, delta vs. the previous entry on each dimension if available); open topics as a list with an open/close toggle (toggle calls a small PATCH route `src/app/api/open-topics/[id]/route.ts`); blind-spot patterns as badges/rows showing the occurrence count, visually flagged (e.g. accent-colored) once `occurrenceCount >= 3` to mirror the source system's "rule of 3". Empty states for each of the three sections independently.
- Real-case consulting track: `src/app/api/coaches/[coachId]/sessions/[sessionId]/consult/route.ts` (`POST`) — given a list of selected advisor ids/names (mix of the coach's static `AdvisorRoster` and `advisor_profile` rows visible to the user, i.e. `ownerUserId = currentUser OR isShared = true`), builds a consultation-specific prompt (each advisor's lens + Franz/personal profiles' `whatTheyThink`/`howTheyDecide`) and calls `getModel("board")`, streaming the synthesized board response into the same chat transcript as a specially-tagged assistant message. After the response, save a `real_case` row (`problem` summarized from the user's question, `advisorsConsulted`, `advice` from the response, `actionsDecided` left for the user to fill or extracted by the same memory pass). Add an "Advisory Board" picker UI in the chat component (Phase 2) — a small popover/sheet listing available advisors (checkboxes), triggered by a button near the chat input, only relevant when the coach is in the "consulting" track (this can be surfaced for all sessions; the underlying source system asks the user to choose the track conversationally, so the picker is just an optional tool available at any time, not a forced mode switch).
- `src/app/(app)/settings/advisor-profile/page.tsx`: server component + form (client component) for the current user's own `advisor_profile` row (the one with `ownerUserId = currentUser`, `isShared = false`) — two text areas ("What I think" / "How I decide"), save via a `src/app/api/advisor-profile/route.ts` (`GET`/`PUT`, upsert on the current user). Empty state explaining the feature before anything is written.

- [x] [wave:1] Memory extraction function (`src/lib/coaches/memory.ts`) + wire into chat route's wrap-up trigger
- [x] [wave:1] "End session & save progress" API route + chat UI button
- [x] [wave:2] Progress page (progress entries, open topics with toggle, blind-spot patterns)
- [x] [wave:2] Advisor profile settings page + API route
- [x] [wave:3] Real-case consulting track: consult API route + Advisory Board picker UI

## Phase 4 — Shell, auth, landing [feature: coaching-shell]

### Files to Read
- `src/app/page.tsx`, `src/app/home-content.tsx` (current setup wizard, to be replaced)
- `src/app/dashboard/*` (current placeholder, to be replaced)
- `src/app/(auth)/*`
- `src/components/auth/*`
- `src/components/ui/*`
- `src/hooks/use-setup-status.ts`
- `DESIGN.md`
- `docs/business/starter-prompt.md`

### Technical Details
- Replace `src/app/page.tsx` (and remove/retire `home-content.tsx`'s setup-wizard usage) with the real public landing page: hero section (headline + subhead + "Get started" CTA linking to signup) per `DESIGN.md`'s "land-hero" pattern, a three-card feature grid presenting the three coaches, a closing CTA block. Unauthenticated only — if a session exists, redirect to the app home. Do not delete `use-setup-status.ts` if other parts of the boilerplate depend on it; if it becomes unused after this change, remove it and its usages together.
- Replace the placeholder under `src/app/dashboard/` with the real authenticated app home, moved under the new `(app)` route group from Phase 2 (i.e. `src/app/(app)/page.tsx` or `src/app/(app)/dashboard/page.tsx`, matching whatever route the sidebar links to) — `requireAuth`, three coach cards with "Start/Continue session" CTAs (reusing data already fetched for the coach landing pages where possible), a "Recent sessions" section across all coaches. Empty state for a brand-new user (no sessions yet across any coach): show the three coach cards with a one-line explainer instead of a recent-sessions section.
- Apply `DESIGN.md`'s Button/Card/Input customizations to the existing `src/components/auth/*` login/signup forms and any other shared shadcn primitives touched so far, so the whole app (not just the new pages) reads as one system.
- Verify end-to-end: a user who exceeds `RATE_LIMITS.coachChat` gets a clear, on-brand message in the chat UI (not a raw JSON error) — adjust the Phase 2 chat component's error handling if needed so a 429 response renders a friendly "You've reached today's message limit, come back tomorrow" toast/inline message instead of a generic error.

- [x] [wave:1] Replace `/` with the real landing page
- [x] [wave:1] Replace `/dashboard` placeholder with the real authenticated app home
- [x] [wave:2] Apply DESIGN.md styling to auth forms and shared primitives
- [x] [wave:2] Verify/fix rate-limit error UX in the chat UI

## Phase 5 — Quality gates [feature: coaching-shell]

### Files to Read
- Whatever files were touched in Phases 1-4 (re-read as needed per task)

### Technical Details
- Sweep every new page/component built in Phases 2-4 for: empty states, loading states (skeletons, not blank flashes), correct behavior at a 375px viewport, consistent spacing per `DESIGN.md`. Fix anything missing directly rather than filing it for later.
- Run `pnpm check` (lint + typecheck) at the project root and fix any remaining issues.
- Do a manual reasoning pass (not an automated test) confirming the full loop is wired correctly: sign up → land on app home → open a coach → send a message → see it stream → see the session appear in the sidebar history → open progress page → see it empty until a session is ended/wrapped-up.

- [x] [wave:1] Empty/loading/mobile/spacing sweep across all new UI
- [x] [wave:1] `pnpm check` clean
- [x] [wave:2] End-to-end reasoning pass across the full user loop
