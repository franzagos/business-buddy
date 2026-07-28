/**
 * Shared wrap-up keyword heuristic. Used client-side (chat-transcript.tsx)
 * to detect when a user's message signals "let's save/close out" and
 * automatically trigger the same visible "end session" flow (recap dialog
 * included) instead of a silent server-side save the user never sees.
 */
export const WRAP_UP_KEYWORDS = [
  "salviamo",
  "chiudiamo",
  "abbiamo finito",
  "salva",
  "save",
  "let's wrap up",
  "wrap up",
  "let's save",
];

export function looksLikeWrapUp(content: string): boolean {
  const normalized = content.toLowerCase();
  return WRAP_UP_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
