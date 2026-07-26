# Coaching Platform — Requirements

## Summary
Turn the existing "Business Coach" system (three Claude Skills: Executive Coach, Agency Coach, Startup Coach — each with a persona, a case-based training method, an Advisory Board of experts, an evaluation rubric, and file-based memory) into a standalone web app. Any visitor can sign up, pick a coach, and have the same coaching experience they currently get inside Claude, without needing Claude Code.

## Users & Roles
- Public, self-service signup. No admin/moderator role in this first version.
- Every user has their own private data: sessions, progress, open topics, real cases, blind-spot patterns.
- One shared, optional "voice": **Franz**, the original personal advisor persona from the source system. It is owned by the app owner's account and marked as a shared Advisory Board member selectable by any user. Any user may additionally create their own personal advisor profile (their own "voice of the house") for their own Advisory Board consultations.

## Authentication
- Email/password + Google OAuth via the already-configured Better Auth.
- Signup is open (no invite gate).
- Unauthenticated visitors see a marketing/landing page (not the setup wizard) and are redirected to `/login` when trying to reach app routes.

## Core Features

1. **Three coaches**, each with its own system prompt content ported from the existing skill files (persona, style rules, activation triggers, case-method flow, Advisory Board consultation flow):
   - Executive Coach (wartime CEO / peacetime growth, case method + advisory board)
   - Agency Coach
   - Startup Coach
2. **Chat interface** per coach, streaming responses (Vercel AI SDK + OpenRouter), Markdown rendering (already available via `react-markdown`).
3. **Session history** — each user can have multiple past conversations per coach (like ChatGPT/Claude history), can resume any of them. Memory (progress, open topics, blind-spot patterns) is shared across all sessions of the same coach for a given user, not per-session.
4. **Structured memory in the database** (replacing the source system's Markdown files), read by the model at the start of each session and updated at the end of a session or on explicit "save"/"let's wrap up" cues:
   - Progress entries (dated, with rubric scores 1-10 per dimension + delta vs. previous entries)
   - Open topics (open/closed, with a "why it's open" and "how to test it" note)
   - Recurring blind-spot patterns with an occurrence counter (the source system's "rule of 3": a pattern seen 3+ times becomes the deliberate target of the next case)
   - Real-case consultations log (date, problem, advisors consulted, advice given, actions decided) — kept separate from training-session progress, matching the source system's `Casi-reali.md`
5. **Advisory Board**: a fixed roster of expert personas (Munger, Bezos, Horowitz, Annie Duke, Paul Graham, etc., ported from `Advisory-Board.md`) usable in the "real case consultation" track, plus:
   - The shared **Franz** voice (owner-authored, available to everyone)
   - Optional **personal advisor profiles**: any user can write their own "what I think" / "how I decide" profile and use it as their own voice in the board
6. **Rubric-based evaluation**: each training session can end with scores (1-10) across coach-specific dimensions, shown with delta vs. previous sessions.
7. **Rate limiting**: free usage with a daily message cap per user (via the existing `applyRateLimit` utility) to control AI cost. No payment integration in this version.
8. **Style/quality gate**: the system prompt for each coach carries over the source system's anti-AI-writing-tell rules (no em dash, no "Recap:" blocks, no formulaic phrasing) as instructions to the model — this is prompt content, not app logic.

## Non-Goals (this version)
- No payment/subscription tiers.
- No admin dashboard for moderating users or content.
- No voice/audio input, no file uploads inside chat.
- No editing of the fixed Advisory Board expert roster by end users (only their own personal advisor profile).

## Data Model (see `decisions.md` for schema details)
New tables: `coaching_session`, `coaching_message`, `progress_entry`, `open_topic`, `real_case`, `blind_spot_pattern`, `advisor_profile`.

## AI Models
Multiple OpenRouter models by function (see `decisions.md`), all configurable via env vars.

## Design
Follows `DESIGN.md` at the project root (Loop design system: navy/teal/cyan, Poppins + Inter + JetBrains Mono, pill buttons, hairline-bordered cards, sidebar shell, light + dark mode).
