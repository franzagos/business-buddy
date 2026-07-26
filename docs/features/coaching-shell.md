# Coaching Shell

## What It Does
The app chrome and entry experience around the coaches: a public marketing landing page for signed-out visitors, an authenticated app home listing the three coaches and recent sessions, and the sidebar shell (collapsible on mobile) used across every authenticated screen. Built on the Loop design system (navy/teal/cyan, Poppins + Inter + JetBrains Mono, pill buttons, hairline-bordered cards) per `DESIGN.md`.

## Data Model
### New Tables
None — this feature is purely UI/routing; it reads `coaching_session` (from `coaching-chat`) for the recent-sessions list.

### Modified Tables
None.

## API Routes
None — the shell reads data via the `coaching-chat` sessions route (`GET /api/coaches/[coachId]/sessions`) and server components; it doesn't add its own API surface.

## Key Files
- `src/app/page.tsx` — public landing page (replaces the boilerplate's setup wizard at `/`): hero, feature grid, CTA, redirects authenticated visitors onward.
- `src/app/(app)/dashboard/page.tsx` — authenticated app home: three coach cards (Executive/Agency/Startup) with Continue/Start session actions, recent sessions across coaches, first-time-user empty state.
- `src/components/app-shell/sidebar.tsx` — the persistent sidebar (240px, collapsible/drawer on mobile), grouped nav ("Coaches" / "Progress" / "Account").
- `src/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx` — Better Auth email/password + Google OAuth flows (pre-existing boilerplate auth, styled to the Loop design system).
- `src/lib/session.ts` — `requireAuth()` used by protected server components to redirect unauthenticated visitors to `/login`.

## Environment Variables
None new — uses the existing `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`.

## Notes for Future Development
- `/` and `/dashboard` were boilerplate scaffolding (setup wizard and placeholder dashboard) and have been fully replaced, not appended to — do not resurrect the wizard content.
- The old boilerplate `src/app/profile/` route and `src/components/user-header.tsx` were unstyled leftovers not linked from any part of the built app; they were removed as part of this feature's cleanup (see repo history / wrap-up commit).
- Mobile behavior: sidebar collapses to a hamburger drawer; verify this still holds at 375px width if the shell layout changes.
