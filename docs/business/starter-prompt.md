# Business Buddy — Project Context

> Paste this file into any new agent session (Claude Code, OpenAI Codex, Cursor Composer, or similar) to restore full project context instantly.

## ⚠ Critical Build Constraints

1. Routes `/` and `/dashboard` in the boilerplate are setup/demo scaffolding — **fully replace their contents**, never append to them
2. Never use Lorem Ipsum or placeholder text like "Coming soon" in any deliverable screen
3. Every screen that shows a list or table **must** have a real empty state implemented, not a blank box
4. The first build must be visually complete — no "I'll style this later" stubs or unstyled sections
5. Do not use the default shadcn gray card-with-title layout as a stand-in for real UI
6. The coach system prompts (persona, style rules, case method, advisory board) must be ported **faithfully** from the source files under `Business Coach/` — this is the whole point of the app. Don't paraphrase or simplify the coaching logic when moving it into code.

---

## What This App Does
Business Buddy turns three existing AI coaching personas (Executive Coach, Agency Coach, Startup Coach — originally Claude Skills with file-based memory) into a standalone web app, so anyone can use them outside of Claude Code, with their own account and their own persistent coaching history.

## Users & Roles
- Public self-service signup (email/password or Google). No admin role.
- Every user has fully private data (sessions, progress, open topics, blind-spot patterns, real cases).
- One shared exception: **Franz**, the app owner's personal advisor voice, is available to every user as an optional Advisory Board member. Users can also create their own personal advisor profile.

## Authentication
Better Auth, email/password + Google OAuth (both already configured in the boilerplate). Signup is open. Unauthenticated visitors see a real marketing landing page, not the setup wizard.

## Key Screens

### Pre-login (landing page, replaces `/`)
- Layout: full-width marketing sections per the Loop design system's landing blocks (hero, feature grid, CTA)
- Primary element: hero with headline + "Get started" CTA (pill, teal accent)
- Empty/unauthenticated state: n/a — this is the public page

### App home (replaces `/dashboard`)
- Layout: sidebar shell (240px, collapsible on mobile) + main content, max-w-6xl
- Primary element: three coach cards (Executive / Agency / Startup), each with a "Continue" or "Start session" pill button
- Secondary elements: recent sessions across all coaches
- Empty state: first-time user sees the three coach cards with no recent sessions section, a one-line explainer instead
- Mobile: sidebar collapses to a hamburger drawer

### Coach chat (`/coaches/[coachId]/sessions/[sessionId]`)
- Layout: sidebar (session history for this coach + other coaches) + centered chat transcript, max-w-3xl
- Primary element: streaming chat transcript, Markdown-rendered assistant messages, chat input pinned to bottom
- Secondary elements: coach badge (name + register wartime/peacetime if applicable), "End session & save progress" action
- Empty state: new session shows the coach's welcome message (ported from the source SKILL.md's "BENVENUTO" section) as the first assistant turn
- Mobile: sidebar becomes a drawer, chat input stays pinned and usable at 375px

### Progress (`/coaches/[coachId]/progress`)
- Layout: single column, max-w-3xl
- Primary element: list of past progress entries with rubric scores + delta vs. previous
- Secondary elements: open topics list (open/closed toggle), blind-spot patterns with occurrence count
- Empty state: "No sessions completed yet — finish a training session to see your first progress entry" with a CTA back to the coach

### Advisor profile settings (`/settings/advisor-profile`)
- Layout: single form, max-w-2xl
- Primary element: two text areas ("what I think" / "how I decide"), matching the source system's Franz-Consulente split
- Empty state: explains what this is used for (appears as your own voice in the Advisory Board) before the user writes anything

## Core Features
1. Three coaches with faithfully-ported personas, style rules, and case-method/consulting flows
2. Streaming chat with session history (multiple sessions per coach, resumable)
3. Structured memory in Postgres: progress entries with rubric scores, open topics, recurring blind-spot patterns (rule of 3), real-case consultation log
4. Advisory Board: fixed expert roster + shared Franz voice + per-user personal advisor profiles
5. Daily message rate limit per user (no payment tier in this version)
6. Writing-quality gate carried over as system-prompt instructions (no em dash, no formulaic "Recap:" endings, etc.)

## Design System

**Layout**: sidebar (240px, collapsible) · fixed shell, scrollable content · max-w-6xl for lists/dashboards, max-w-3xl for chat
**Density**: balanced
**Accent color**: teal-600 `#0A7E8F` (light) / cyan-400 `#22C7D8` (dark) · **Mode**: light + dark, user-toggleable
**Border radius**: pill buttons (`--r-full`), standard cards (`--r-md`, 14px)
**Typography scale**: default — Poppins (headings) + Inter (body) + JetBrains Mono (scores/timestamps)
**Reference apps**: the user's own Loop design system document (colors/type/components), Linear (shell density), Claude.ai/ChatGPT (chat + session history pattern)
**Tone**: direct, calm, competent — no marketing hype, no emoji in UI copy

### Component Conventions
- **Forms**: dedicated page for advisor profile; inline for session actions
- **Confirmation dialogs**: destructive actions only (deleting a session)
- **Loading states**: skeleton for session list, streaming text for chat responses
- **Notifications**: toast (Sonner, already in the boilerplate), top-right, used for save confirmations and rate-limit warnings
- **Tables/lists**: paginated (`.limit(50)`), row actions via dropdown menu
- **Navigation**: sidebar grouped by "Coaches" / "Progress" / "Account", active state = navy-900 text + `--ice-tint` background

## Integrations
OpenRouter (multiple models by function — see `specs/coaching-platform/decisions.md`). No other third-party integrations in this version.

## Tech Stack
Next.js 16 · React 19 · TypeScript · Better Auth · PostgreSQL via Docker (local) + managed Postgres (production) + Drizzle ORM · shadcn/ui · Tailwind 4 · OpenRouter

---

## Context for Your Agent

This project was scaffolded from Simo's Agentic Coding Boilerplate. Important rules:

- **Do NOT restore boilerplate placeholder content.** The following default pages exist in the boilerplate and must be completely replaced — not appended to:
  - `/` — interactive setup wizard (replace with the actual landing page once setup is complete)
  - `/dashboard` — placeholder dashboard (replace with the real app dashboard)
- Read `src/lib/schema.ts` to understand the data model before any database work.
- Read `DESIGN.md` at the project root before any UI work — it is the source of truth for the app's visual direction.
- Check `specs/coaching-platform/` for implementation decisions and task status.
- Follow all conventions in `AGENTS.md`.
- Use `src/lib/api-utils.ts` helpers for all API routes (applyRateLimit, requireApiAuth, parseBody, apiResponse, apiError).
- The source coaching content lives under `Business Coach/` at the project root — treat it as the canonical content to port into `src/lib/coaches/`, not as scaffolding to delete. Keep the original folder in place until the port is verified complete.

## Spec Location
`specs/coaching-platform/`
- `requirements.md` — full requirements
- `implementation-plan.md` — phased task list with completion status
- `decisions.md` — architecture decisions (schema, model routing, rate limits)
- `action-required.md` — manual setup steps
