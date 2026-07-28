# Business Buddy

Business Buddy is an AI coaching web app built around three business-coach personas — Executive, Agency, and Startup — ported from the founder's own Claude Skills coaching system into a standalone product anyone can sign up and use.

Each coach carries the full persona, style rules, case-based training method, and Advisory Board consultation flow from the original source material. Conversations stream in real time, memory persists per user across sessions, and progress is tracked with rubric scores, open topics, and recurring blind-spot patterns — the same structure the original Markdown-file system used, now backed by a database.

## Features

### Three AI coaches
Executive Coach (wartime CEO / peacetime growth), Agency Coach, and Startup Coach, each with a faithfully-ported persona and case-method coaching flow. Every reply is checked against a shared writing-quality gate (no em dash, no "Recap:" blocks, no formulaic AI phrasing).

### Streaming chat with session history
Each coach supports multiple, resumable sessions per user — like ChatGPT/Claude history. Messages stream token-by-token with Markdown rendering, and sessions are auto-titled from the opening message.

### Structured memory & progress tracking
Progress entries with rubric scores (1-10 per dimension, with deltas vs. previous sessions), open topics, and recurring blind-spot patterns (a pattern seen 3+ times is flagged per the "rule of 3"). Memory is extracted automatically on wrap-up cues or via an explicit "End session & save progress" action.

### Advisory Board
A fixed roster of expert personas per coach (Munger, Bezos, Horowitz, Annie Duke, Paul Graham, and others), plus a shared "Franz" voice (the founder's own advisor persona, available to every user) and optional personal advisor profiles any user can write for themselves. Used in real-case consulting sessions, logged separately from training progress.

### Rate limiting
A daily per-user message cap keeps AI cost bounded, with a clear in-app message when the limit is reached — no payment tier in this version.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9
- **AI**: Vercel AI SDK 5 + OpenRouter, with per-function model routing (chat, advisory board synthesis, memory extraction, session titling)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS 4, Loop design system (navy/teal/cyan, Poppins/Inter/JetBrains Mono), dark mode
- **Package Manager**: pnpm

## Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone <this-repo-url>
   cd business-buddy
   pnpm install
   ```

2. Create your local environment file:
   ```bash
   cp env.example .env
   ```
   Fill in at minimum:
   - `OPENROUTER_API_KEY` — required for chat, Advisory Board, memory extraction, and session titling. Get one at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).
   - `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`.
   - `OWNER_EMAIL` — the email of the account that should own the shared "Franz" advisor profile (seeded after that account is created).
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional) — enables "Sign in with Google".

3. Start the database:
   ```bash
   docker compose up -d
   pnpm run db:migrate
   ```

4. Start the app:
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`, sign up, then set `OWNER_EMAIL` to that account's email if you haven't already and run:
   ```bash
   pnpm run db:seed
   ```
   to seed the shared "Franz" advisor profile.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_URL` | Yes | Database connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth session secret |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key, powers all AI features |
| `OPENROUTER_MODEL_CHAT` | No | Model for coach chat turns (default `anthropic/claude-sonnet-4.5`) |
| `OPENROUTER_MODEL_BOARD` | No | Model for Advisory Board synthesis (default `anthropic/claude-sonnet-4.5`) |
| `OPENROUTER_MODEL_MEMORY` | No | Model for memory extraction (default `openai/gpt-4.1-mini`) |
| `OPENROUTER_MODEL_TITLE` | No | Model for session title generation (default `openai/gpt-4.1-mini`) |
| `OWNER_EMAIL` | No | Account that owns the shared "Franz" advisor profile, used by `pnpm run db:seed` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables Google OAuth sign-in |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | No | Enables transactional email |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob storage in production (local dev uses the filesystem) |

## Development Scripts

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm check            # Lint + typecheck
pnpm run db:generate  # Generate a migration after schema.ts changes
pnpm run db:migrate   # Apply migrations
pnpm run db:seed      # Seed the shared "Franz" advisor profile (requires OWNER_EMAIL)
pnpm run db:studio    # Open Drizzle Studio (database GUI)
pnpm test:e2e         # Run Playwright end-to-end tests
```

## Project Structure

- `src/lib/coaches/` — per-coach persona, advisory board roster, rubric, and the shared writing-quality gate; `getCoach(coachId)` assembles the final system prompt.
- `src/lib/coaches/memory.ts` — structured memory extraction from a session transcript into progress entries, open topics, and blind-spot patterns.
- `src/app/api/coaches/` — session and chat API routes.
- `src/app/(app)/` — authenticated app shell: coach pages, chat, progress, advisor profile settings.
- `docs/features/` — living documentation of each capability (`coaching-chat.md`, `coaching-memory.md`, `coaching-shell.md`).
- `specs/coaching-platform/` — requirements and architecture decisions behind the coaching platform.

## Deploy

1. Push to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. Add production environment variables.
4. Use a managed Postgres instance in production — [Neon](https://neon.tech) has a free tier.

MIT License
# business-buddy
