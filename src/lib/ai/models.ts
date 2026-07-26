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

const MODEL_DEFAULT: Record<ModelFunction, string> = {
  chat: "anthropic/claude-sonnet-4.5",
  board: "anthropic/claude-sonnet-4.5",
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
