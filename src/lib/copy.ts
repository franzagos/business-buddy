/**
 * Small shared UI strings reused across multiple components/pages.
 * Centralized so a wording change doesn't need to be hunted down in every
 * file that happens to need the same fallback/message.
 */

/** Shown wherever a session has no title yet (fallback, not a placeholder). */
export const DEFAULT_SESSION_TITLE = "Nuova sessione";

/** Generic "couldn't save X, try again" toast — {entity} is the thing that failed to save. */
export function saveErrorMessage(entity: string): string {
  return `Non sono riuscito a salvare ${entity}. Riprova.`;
}

/** Generic "couldn't delete X, try again" toast — {entity} is the thing that failed to delete. */
export function deleteErrorMessage(entity: string): string {
  return `Non sono riuscito a eliminare ${entity}. Riprova.`;
}
