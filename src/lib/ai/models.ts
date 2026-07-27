import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * Per-function OpenRouter model routing for the coaching platform.
 * Each function has its own env var override so cost/quality can be tuned
 * later without code changes. See specs/coaching-platform/decisions.md.
 */

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

type ModelFunction = "chat" | "board" | "memory" | "title";

const MODEL_ENV_VAR: Record<ModelFunction, string> = {
  chat: "OPENROUTER_MODEL_CHAT",
  board: "OPENROUTER_MODEL_BOARD",
  memory: "OPENROUTER_MODEL_MEMORY",
  title: "OPENROUTER_MODEL_TITLE",
};

// Kept cheap on purpose (target: well under $0.03/session). GPT-4.1 Mini
// ($0.15/$0.60 per M tokens) vs. Claude Sonnet 4.5 ($3/$15 per M) — a
// typical multi-turn coaching session on Sonnet was landing around
// $0.05-0.10; on GPT-4.1 Mini the same session costs roughly $0.005-0.01.
// Bump a single function back up via its env var override if quality ever
// needs it more than cost discipline.
const MODEL_DEFAULT: Record<ModelFunction, string> = {
  chat: "openai/gpt-4.1-mini",
  board: "openai/gpt-4.1-mini",
  memory: "openai/gpt-4.1-mini",
  title: "openai/gpt-4.1-mini",
};

/**
 * Get the OpenRouter model instance for a given coaching-platform function.
 *
 * Usage:
 *   const model = getModel("chat");
 *   const result = streamText({ model, ... });
 */
export function getModel(fn: ModelFunction) {
  const modelId = process.env[MODEL_ENV_VAR[fn]] || MODEL_DEFAULT[fn];
  return openrouter(modelId);
}
