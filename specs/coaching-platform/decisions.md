# Coaching Platform — Decisions

## Coach content source
Ported verbatim (persona, style rules, case-method flow, advisory board protocol) from:
- `Business Coach/executive-coach-system/SKILL.md`, `Advisory-Board.md`, `Rubrica-valutazione.md`, `Franz-Consulente.md`, `Cosa Pensa Franz.md`
- `Business Coach/agency-coach-system/*`
- `Business Coach/startup-coach-system/*`
- `Business Coach/Anti LLM Agent/SKILL.md` + `references/pattern-anti-llm.md` (writing-quality gate)

These become static content modules under `src/lib/coaches/<coach-id>/` (persona prompt, advisory board roster, rubric definition) loaded server-side and injected into the system prompt. Not stored in the database — they're app content, versioned in git like the rest of the code.

## Coach identifiers
`executive`, `agency`, `startup` (stable slugs used in routes and the `coach_id` column).

## Database schema additions (`src/lib/schema.ts`)

```
coaching_session
  id            uuid PK
  userId        text  FK -> user.id, cascade delete, indexed
  coachId       text  ('executive' | 'agency' | 'startup'), indexed
  title         text  (auto-generated from first message, editable)
  track         text  ('training' | 'consulting') nullable, matches source system's binario A/B
  register      text  ('wartime' | 'peacetime') nullable
  createdAt     timestamp
  updatedAt     timestamp
  -- index on (userId, coachId, updatedAt) for the session list

coaching_message
  id            uuid PK
  sessionId     uuid FK -> coaching_session.id, cascade delete, indexed
  role          text ('user' | 'assistant')
  content       text
  createdAt     timestamp
  -- index on (sessionId, createdAt)

progress_entry
  id            uuid PK
  userId        text FK -> user.id, cascade delete, indexed
  coachId       text, indexed
  sessionId     uuid FK -> coaching_session.id, nullable (entry may summarize a session)
  register      text nullable
  decision      text
  blindSpots    jsonb  (array of {label, category})
  scores        jsonb  (array of {dimension, score, note})
  lesson        text
  createdAt     timestamp

open_topic
  id            uuid PK
  userId        text FK -> user.id, cascade delete, indexed
  coachId       text, indexed
  topic         text
  reason        text
  howToTest     text
  status        text ('open' | 'closed') default 'open'
  closedAt      timestamp nullable
  createdAt     timestamp

blind_spot_pattern
  id             uuid PK
  userId         text FK -> user.id, cascade delete, indexed
  coachId        text, indexed
  pattern        text
  occurrenceCount integer default 1
  lastSeenAt     timestamp
  createdAt      timestamp
  -- unique (userId, coachId, pattern)

real_case
  id             uuid PK
  userId         text FK -> user.id, cascade delete, indexed
  coachId        text, indexed
  problem        text
  advisorsConsulted jsonb (array of advisor ids/names)
  advice         text
  actionsDecided text
  createdAt      timestamp

advisor_profile
  id           uuid PK
  ownerUserId  text FK -> user.id, cascade delete
  name         text
  whatTheyThink text   (source system's "Cosa Pensa" layer)
  howTheyDecide text   (source system's "Consulente" / decision layer)
  isShared     boolean default false   -- true only for the seeded Franz profile
  createdAt    timestamp
  updatedAt    timestamp
  -- advisory board query = advisor_profile where ownerUserId = currentUser OR isShared = true
```

All list queries use `.limit(50)` and paginate by `updatedAt desc` / `createdAt desc` per the project's query rules. All FK-filtered columns get an index per `schema.ts` convention already used for `user_email_idx` etc.

## Franz shared voice
Seeded once via a migration/seed script: an `advisor_profile` row with `isShared = true`, owned by the account matching an `OWNER_EMAIL` env var (defaults to the app owner's account created on first deploy). Content ported from `Franz-Consulente.md` + `Cosa Pensa Franz.md`. If that owner account doesn't exist yet at seed time, the seed is a no-op and can be re-run later (`pnpm run db:seed`, added as a new script).

## AI models (OpenRouter, via `src/lib/ai/models.ts`)
Different tasks get different models, each overridable by its own env var so cost/quality can be tuned later without code changes. **Cost discipline is a hard requirement** (target: well under $0.03/session) — all four functions default to the same cheap model, GPT-4.1 Mini ($0.15/$0.60 per M input/output tokens), rather than a frontier model like Claude Sonnet 4.5 ($3/$15 per M — the original default, which was landing around $0.05-0.10/session in testing):

| Function | Env var | Default | Why |
|---|---|---|---|
| Coach chat (training + consulting turns) | `OPENROUTER_MODEL_CHAT` | `openai/gpt-4.1-mini` | Cheap enough to keep a multi-turn session well under budget; good enough instruction-following for the style rules. Bump to `anthropic/claude-haiku-4.5` ($1/$5 per M) only if quality on short sessions justifies the ~7x cost |
| Advisory Board synthesis | `OPENROUTER_MODEL_BOARD` | `openai/gpt-4.1-mini` | Same cost reasoning as chat |
| Memory extraction/summarization (end-of-session progress entry, open topics, blind-spot detection) | `OPENROUTER_MODEL_MEMORY` | `openai/gpt-4.1-mini` | Structured extraction from a transcript, doesn't need frontier reasoning |
| Session title generation | `OPENROUTER_MODEL_TITLE` | `openai/gpt-4.1-mini` | Trivial task, minimize cost |

`src/lib/ai/models.ts` exports one `getModel(fn: "chat" | "board" | "memory" | "title")` helper wrapping `createOpenRouter`, replacing ad-hoc model selection in each route.

## Rate limiting
New `RATE_LIMITS.coachChat` entry in `src/lib/rate-limit.ts`: 40 messages/day per user (generous enough for a real session, cheap enough to bound cost). Applied in the chat route via `applyRateLimit("coach-chat", RATE_LIMITS.coachChat)` keyed by user id (not IP), so it works the same regardless of how many devices a user is on.

## Session lifecycle & memory writes
- On each user message, the full running system prompt is rebuilt from: coach persona + relevant recent `progress_entry` rows + open `open_topic` rows + `blind_spot_pattern` rows with `occurrenceCount >= 3` + (for consulting track) the requested `advisor_profile` rows.
- Memory writes happen server-side, triggered when: the user's message matches a "let's wrap up / save" intent (simple keyword heuristic, matching the source system's "salva", "chiudiamo", "abbiamo finito"), OR when a session is explicitly closed from the UI ("End session & save progress" action). This calls the memory-extraction model once against the session transcript and upserts `progress_entry` / `open_topic` / `blind_spot_pattern` rows.

## Design system integration
`DESIGN.md` (already written at project root) is the source of truth. Tailwind `@theme` tokens in `src/app/globals.css` are updated to the Loop palette (light + dark), Poppins/Inter/JetBrains Mono are loaded via `next/font/google`, and shadcn primitives (Button, Card, Input, Badge) get the customizations listed in `DESIGN.md`.
