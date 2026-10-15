import OpenAI from "openai";
import type { Response } from "openai/resources/responses/responses";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import {
  openaiApiKey,
  openaiApiKeyLooksInvalid,
  websiteAiModel,
  websiteAiReasoningEffort,
} from "@/lib/website-ai/config";
import { classifyAiError, usageFrom, type AiCallResult } from "./result";

const REQUEST_TIMEOUT_MS = 60_000;

export function assistantModel(): string {
  return websiteAiModel();
}

export function aiConfigured(): boolean {
  const key = openaiApiKey();
  return Boolean(key) && !openaiApiKeyLooksInvalid(key);
}

function client(): OpenAI | null {
  const key = openaiApiKey();
  if (!key || openaiApiKeyLooksInvalid(key)) return null;
  return new OpenAI({ apiKey: key, timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 });
}

function supportsReasoning(model: string): boolean {
  return /^(gpt-5|gpt-6|o\d)/i.test(model);
}

export type StructuredRequest<S extends z.ZodType> = {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  maxOutputTokens: number;
  /** Submit as a background response; poll with `retrieveStructured`. */
  background?: boolean;
};

function refusalText(res: Response): string | null {
  for (const item of res.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content) if (part.type === "refusal") return part.refusal;
  }
  return null;
}

/** Interprets a finished/pending response against the schema. */
export function interpretResponse<S extends z.ZodType>(res: Response, schema: S): AiCallResult<z.infer<S>> {
  if (res.status === "queued" || res.status === "in_progress") return { status: "pending", responseId: res.id };
  const usage = usageFrom(res.usage);
  if (res.status === "cancelled") return { status: "error", code: "expired", retryable: true, message: "Response cancelled", usage };
  if (res.status === "failed") {
    const message = `Response failed: ${res.error?.message?.slice(0, 200) ?? "unknown"}`;
    return { status: "error", code: "provider", retryable: true, message, usage };
  }
  if (refusalText(res)) return { status: "error", code: "refusal", retryable: false, message: "Model refused", usage };
  if (res.status === "incomplete") {
    const reason = res.incomplete_details?.reason ?? "unknown";
    return { status: "error", code: "incomplete", retryable: reason !== "content_filter", message: `Incomplete: ${reason}`, usage };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(res.output_text);
  } catch {
    return { status: "error", code: "invalid_output", retryable: true, message: "Output was not JSON", usage, issues: ["Return valid JSON."] };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 8).map((i) => `${i.path.join(".")}: ${i.message}`);
    return { status: "error", code: "invalid_output", retryable: true, message: "Output failed validation", usage, issues };
  }
  return { status: "completed", data: parsed.data, usage, model: res.model, responseId: res.id };
}

/** One structured Responses API call (strict JSON Schema). Never throws. */
export async function callStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<AiCallResult<z.infer<S>>> {
  const openai = client();
  if (!openai) return { status: "error", code: "not_configured", retryable: false, message: "OPENAI_API_KEY not configured" };
  const model = assistantModel();
  try {
    const res = await openai.responses.create({
      model,
      instructions: req.instructions,
      input: req.input,
      text: { format: zodTextFormat(req.schema, req.name) },
      max_output_tokens: req.maxOutputTokens,
      store: Boolean(req.background),
      background: Boolean(req.background),
      ...(supportsReasoning(model) ? { reasoning: { effort: websiteAiReasoningEffort() } } : {}),
    });
    return interpretResponse(res, req.schema);
  } catch (err) {
    return classifyAiError(err);
  }
}

/** Polls a background response once. */
export async function retrieveStructured<S extends z.ZodType>(responseId: string, schema: S): Promise<AiCallResult<z.infer<S>>> {
  const openai = client();
  if (!openai) return { status: "error", code: "not_configured", retryable: false, message: "OPENAI_API_KEY not configured" };
  try {
    const res = await openai.responses.retrieve(responseId);
    return interpretResponse(res, schema);
  } catch (err) {
    const result = classifyAiError<z.infer<S>>(err);
    if (result.status === "error" && result.code === "unsupported_model") {
      return { status: "error", code: "expired", retryable: true, message: "Background response not found" };
    }
    return result;
  }
}

export async function cancelBackground(responseId: string): Promise<void> {
  const openai = client();
  if (!openai) return;
  try {
    await openai.responses.cancel(responseId);
  } catch (err) {
    console.warn("[website-ai] cancel background response failed", err instanceof Error ? err.message : err);
  }
}
