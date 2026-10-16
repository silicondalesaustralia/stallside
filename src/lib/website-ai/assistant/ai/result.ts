import OpenAI from "openai";

/** Cached tokens are a subset of input; reasoning tokens are a subset of output. */
export type AiUsage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  known: boolean;
};

export type AiErrorCode =
  | "not_configured"
  | "auth"
  | "unsupported_model"
  | "rate_limit"
  | "timeout"
  | "provider"
  | "refusal"
  | "incomplete"
  | "invalid_output"
  | "expired";

export type AiCallResult<T> =
  | { status: "completed"; data: T; usage: AiUsage; model: string; responseId: string }
  | { status: "pending"; responseId: string }
  | {
      status: "error";
      code: AiErrorCode;
      retryable: boolean;
      /** Safe for logs; never shown raw to sellers. */
      message: string;
      retryAfterMs?: number;
      usage?: AiUsage;
      /** Validation details used for one bounded repair attempt. */
      issues?: string[];
    };

export const NO_USAGE: AiUsage = { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0, known: false };

function retryAfterMs(headers: Headers | undefined): number | undefined {
  const raw = headers?.get("retry-after");
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 1000), 120_000);
  const at = Date.parse(raw);
  return Number.isFinite(at) ? Math.min(Math.max(at - Date.now(), 1000), 120_000) : undefined;
}

/** Maps SDK/network errors to stable codes; raw provider text stays server-side. */
export function classifyAiError<T>(err: unknown): AiCallResult<T> {
  if (err instanceof OpenAI.APIConnectionTimeoutError) {
    return { status: "error", code: "timeout", retryable: true, message: "Model request timed out" };
  }
  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 0;
    const message = `OpenAI ${status}: ${err.message.slice(0, 200)}`;
    if (status === 401 || status === 403) return { status: "error", code: "auth", retryable: false, message };
    if (status === 404) return { status: "error", code: "unsupported_model", retryable: false, message };
    if (status === 429) {
      return { status: "error", code: "rate_limit", retryable: true, message, retryAfterMs: retryAfterMs(err.headers) };
    }
    if (status >= 500 || status === 0) return { status: "error", code: "provider", retryable: true, message };
    return { status: "error", code: "provider", retryable: false, message };
  }
  const message = err instanceof Error ? err.message.slice(0, 200) : "Model request failed";
  return { status: "error", code: "provider", retryable: true, message };
}

type UsageLike = {
  input_tokens?: number;
  input_tokens_details?: { cached_tokens?: number } | null;
  output_tokens?: number;
  output_tokens_details?: { reasoning_tokens?: number } | null;
} | null | undefined;

export function usageFrom(raw: UsageLike): AiUsage {
  if (!raw) return NO_USAGE;
  return {
    inputTokens: raw.input_tokens ?? 0,
    cachedInputTokens: raw.input_tokens_details?.cached_tokens ?? 0,
    outputTokens: raw.output_tokens ?? 0,
    reasoningTokens: raw.output_tokens_details?.reasoning_tokens ?? 0,
    known: true,
  };
}
