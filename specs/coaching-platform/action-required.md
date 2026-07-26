# Action Required

## Before you start building

1. **OpenRouter API key** — add `OPENROUTER_API_KEY` to your `.env` (get one at openrouter.ai/settings/keys). Chat won't work without it. The multi-model setup in `decisions.md` will add `OPENROUTER_MODEL_CHAT`, `OPENROUTER_MODEL_BOARD`, `OPENROUTER_MODEL_MEMORY`, `OPENROUTER_MODEL_TITLE` to `env.example` with sensible defaults — you only need to set overrides if you want different models.
2. **Google OAuth** (optional but recommended since signup is public) — if you want "Sign in with Google" live, add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` per the instructions already in `env.example`. Email/password will work regardless.
3. **Owner email for the shared "Franz" voice** — add `OWNER_EMAIL` to `.env`, set to the email you'll use for your own account (e.g. `francesco@loopsrl.agency`). The seed script that creates the shared Franz advisor profile looks up the user by this email — sign up with that email first, then run the seed.

## After deploying
- Re-run the Franz seed script against production once your production account exists, if it wasn't already seeded via migration on first deploy.
- Consider tightening the daily chat rate limit (`RATE_LIMITS.coachChat` in `src/lib/rate-limit.ts`) once you see real usage/cost data.
