# Research Notes

Lightweight inline research (no parallel research agents dispatched — scope was already well understood from direct inspection of the existing files).

- Confirmed `package.json` already includes `@ai-sdk/react`, `ai`, `@openrouter/ai-sdk-provider`, `react-markdown`, `better-auth` — no new dependencies needed for streaming chat + Markdown rendering.
- Confirmed `src/lib/schema.ts` currently only has Better Auth's own tables — no conflicts with the new tables proposed in `decisions.md`.
- Reviewed all three coach systems under `Business Coach/`: `executive-coach-system`, `agency-coach-system`, `startup-coach-system` share the same file shape (`SKILL.md`, `Advisory-Board.md`, `Rubrica-valutazione.md`, `README.md`, `mia-memoria/`) — confirms the schema in `decisions.md` can be coach-agnostic (single set of tables keyed by `coach_id`) rather than needing per-coach tables.
- `Business Coach/Anti LLM Agent/SKILL.md` is a generic writing-quality gate referenced by the executive coach's SKILL.md — ported as a shared prompt fragment rather than duplicated per coach.
- `Business Coach/Franz/*` (interviews, persona map) is the raw material behind `Franz-Consulente.md` / `Cosa Pensa Franz.md` — not needed directly by the app; the already-distilled files are what gets seeded.
