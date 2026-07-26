export interface RubricDimension {
  id: string;
  label: string;
  icon: string;
}

/** Agency Coach evaluation rubric, ported from Rubrica-valutazione.md. */
export const RUBRIC: RubricDimension[] = [
  { id: "financial-margin", label: "Decisione finanziaria & margine", icon: "landmark" },
  { id: "team-leadership", label: "Leadership & gestione del team", icon: "users" },
  { id: "client-negotiation", label: "Gestione del cliente & negoziazione", icon: "handshake" },
  {
    id: "clarity-under-pressure",
    label: "Lucidità sotto pressione / nella crescita",
    icon: "snowflake",
  },
  { id: "communication-quality", label: "Qualità della comunicazione", icon: "message-circle" },
  { id: "judgment-premortem", label: "Giudizio / pre-mortem", icon: "sparkles" },
];
