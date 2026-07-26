export interface RubricDimension {
  id: string;
  label: string;
  icon: string;
}

/** Executive Coach evaluation rubric, ported from Rubrica-valutazione.md. */
export const RUBRIC: RubricDimension[] = [
  { id: "financial-decision", label: "Decisione finanziaria", icon: "landmark" },
  { id: "leadership-communication", label: "Leadership & comunicazione", icon: "users" },
  {
    id: "clarity-under-pressure",
    label: "Lucidità sotto pressione / nella crescita",
    icon: "snowflake",
  },
  { id: "communication-quality", label: "Qualità della comunicazione", icon: "message-circle" },
  { id: "judgment-premortem", label: "Giudizio / pre-mortem", icon: "sparkles" },
];
