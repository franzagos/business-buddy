# Design Direction — Business Buddy

> Source of truth for the project's aesthetic. The `frontend-design` skill reads this on every UI task.

## Aesthetic direction

**Technical-Utility, branded (Loop design system)**

Business Buddy adapts the user's existing "Loop" agency design system: a confident navy/blue/teal/cyan brand built on Poppins display type and Inter body type, pill-shaped CTAs, hairline-bordered cards, and a signature "loop divider" motif (three dots in a gradient line) used to separate sections. Applied to a coaching app, this reads as serious-but-approachable: the navy carries authority (this is a real coach, not a toy), the teal/cyan accent signals action and progress. Reference: the provided `loop-design-system-ottimizzato-v2.html` document is the literal source of truth for tokens — replicate its hex values, type scale, and component shapes exactly, adapted to app UI (sidebar shell, chat, sessions) rather than marketing slides.

## Reference apps

- The user's own Loop design system document (`loop-design-system-ottimizzato-v2.html`) — colors, type, button/card shapes, loop-divider motif
- Linear — sidebar shell density and information hierarchy for the app chrome
- ChatGPT/Claude.ai — chat transcript layout, streaming message bubbles, session history sidebar pattern

## Typography

**Heading**: Poppins 600/700 — geometric, confident, matches the brand's existing marketing materials
**Body**: Inter 400/500/600 — neutral, highly legible for long chat transcripts
**Mono**: JetBrains Mono 500/600 — used for rubric scores, stat tiles, session dates/timestamps, never for prose
**Pairing rationale**: Poppins carries personality in headings; Inter disappears into long-form reading, which matters heavily here since coaching sessions are read-intensive.

**Scale**: default — h1 ~34px (Display M from the source system, not the 56px marketing-hero size), body 15-16px for chat text
**Tracking**: tight on headings (-0.01em to -0.02em per source system), default elsewhere
**Tabular numerals**: required for rubric scores (1-10) and progress deltas

## Color story

**Mode**: light + dark, user-toggleable, defaults to system
**Light mode** (from source system, used as-is):
- Background: `#EAF6FA` (mint-50)
- Surfaces/cards: `#FFFFFF` with `rgba(19,33,90,.07)` hairline border
- Text: `#151E2E` (ink-900) primary, `#5B6B80` (slate-500) secondary
- Accent (primary action): `#0A7E8F` (teal-600, AA-safe on white)
- Navy (headings, sidebar, high-weight surfaces): `#13215A` (navy-900)
**Dark mode** (derived, same hue family — navy becomes the background instead of the accent-on-white):
- Background: `#0E1730` (darker than navy-900, keeps the same hue)
- Surfaces/cards: `#151F42` with `rgba(255,255,255,.08)` hairline border
- Text: `#EAF0F5` primary, `#93A3B5` (slate-300) secondary — unchanged from source
- Accent: `#22C7D8` (cyan-400) — brighter accent needed for contrast on dark surfaces
- Navy areas (sidebar) become `#0A122C`, one step darker than the page background, to keep hierarchy
**Semantic colors**: success uses teal-600/cyan-400 (same as accent family — no separate green, keeps palette closed); warning uses `#E8654A` (coral-500) from the source system; destructive uses `#C13F28` (coral-700)

These map to the `@theme` block in `src/app/globals.css`.

## Motion personality

**Character**: Restrained and purposeful, matching the "Chiarezza prima di tutto" principle from the source system. Chat messages stream in without bounce; navigation and panel transitions are quick and settle immediately — no playful overshoot.

**Named easings** (define in `globals.css`):
- `ease-snap` — button hover/press, sidebar item active state (120-150ms)
- `ease-settle` — modal/sheet open, new session appearing in the sidebar list (200-250ms, slight ease-out, no bounce)
- `ease-drift` — reserved, unused for now (no ambient decoration in this app)

**Stagger**: session list items on initial load stagger by 30ms, max 5 items
**Reduced motion**: respected globally via `@media (prefers-reduced-motion)`

## Layout personality

**Composition rule**: centered, structured — sidebar + main content, not asymmetric marketing composition (this is a utility app, not a landing page)
**Density**: balanced (not as dense as Linear, not as spacious as the marketing hero blocks in the source system)
**Default page max-width**: chat transcript max-w-3xl (readability); dashboard/list pages max-w-6xl
**Spacing scale**: default, based on the source system's 8px base scale (`--sp-1` through `--sp-24`)
**Whitespace philosophy**: generous around the chat transcript (like the source system's hero padding), tighter in the sidebar and list rows

## Tone of voice

Direct, calm, competent — mirrors the Executive Coach persona's own style rules (no em dash, no bolted-on "Recap:" blocks, no business-book clichés). UI copy is short and instructional, never hypey.
- "Continue session" ✓
- "Pick up right where you left off" ✓
- "Unlock your potential with our AI-powered coaching journey!" ✗
- "🚀 Let's crush your goals!" ✗ (no emoji in UI copy, no exclamation-heavy marketing voice)

## Anti-patterns for this app

- Do not use the 56px marketing-hero display size anywhere inside the app shell — that scale is for the public landing page only
- Do not default to bright cyan for large surfaces — cyan-400 is a small-area accent (buttons, active states, sparkline highlights), never a background
- No card-grid dashboard with generic shadcn gray cards — every card must carry the hairline border + navy/white surface treatment from the source system
- No rounded-full avatars with initials-on-gradient as a stand-in for coach identity — each coach (Executive/Agency/Startup) gets a distinct icon tile using the source system's icon-chip pattern, not a generic avatar
- Never mix the pill-button radius with sharp-cornered cards on the same screen inconsistently — buttons are always pill (`--r-full`), cards are always `--r-md`/`--r-lg`

## Component customizations required

- **Button**: primary = navy-900 fill, pill radius, white text (matches `.btn-primary`); accent = teal-600 fill for the single most important action per screen (start/continue session); outline = 1.5px navy border, transparent fill, for secondary actions
- **Card**: white (dark: `#151F42`) surface, 1px hairline border at `rgba(19,33,90,.07)` (dark: `rgba(255,255,255,.08)`), `--r-md` (14px) radius, no drop shadow except `--shadow-1` on hover/elevated states
- **Input**: bordered (not underline-only) to match the source system's card language, `--r-sm` (8px) radius, teal focus ring matching the source system's `focus-visible` outline
- **Badge**: pill radius, used for coach labels ("Executive Coach"), session status ("wartime" / "peacetime" register), and rubric score chips
- **Sidebar nav item**: matches `.sidenav a` — 7px/10px padding, `--r-sm` radius, `--ice-tint` background on hover, navy-900 text on active
- **Chat bubble**: coach messages get a subtle card treatment (hairline border, white/dark surface); user messages get a filled navy-900 (dark: cyan-400-on-dark) bubble, right-aligned
- **Loop divider**: reused verbatim from the source system (three gradient dots + fading lines) as a section separator inside long coaching transcripts (e.g., between case phases) and between session-history date groups
