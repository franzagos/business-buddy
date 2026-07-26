export interface RubricDimension {
  id: string;
  label: string;
  icon: string;
}

/** Startup Coach evaluation rubric, ported from Rubrica-valutazione.md. */
export const RUBRIC: RubricDimension[] = [
  { id: "financial-runway", label: "Decisione finanziaria & cassa/runway", icon: "landmark" },
  {
    id: "cofounder-leadership",
    label: "Leadership & rapporto co-founder/team",
    icon: "users",
  },
  { id: "investor-negotiation", label: "Gestione investitori & negoziazione round", icon: "handshake" },
  {
    id: "clarity-under-pressure",
    label: "Lucidità sotto pressione / nella crescita",
    icon: "snowflake",
  },
  { id: "communication-quality", label: "Qualità della comunicazione", icon: "message-circle" },
  { id: "judgment-premortem", label: "Giudizio / pre-mortem", icon: "sparkles" },
];
