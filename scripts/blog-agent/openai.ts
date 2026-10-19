/** Minimal OpenAI REST client (Responses + Images) so the agent needs no SDK dependency. */
import { imageModel, logUsage, taskConfig, type AgentTask } from "./model-config";

export type UrlCitation = { type?: string; url?: string; title?: string };

export type ResponsesJson = {
  status?: string;
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string; annotations?: UrlCitation[] }> }>;
  error?: { message?: string } | null;
  incomplete_details?: { reason?: string } | null;
  usage?: Parameters<typeof logUsage>[2];
};

function apiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return key;
}

async function openaiRequest<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 1000);
    throw new Error(`OpenAI ${method} ${path} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

export function openaiPost<T>(path: string, body: unknown): Promise<T> {
  return openaiRequest<T>("POST", path, body);
}

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 40 * 60_000;

/** Background responses avoid HTTP timeouts on long research runs; poll until done. */
export async function awaitResponse(created: ResponsesJson & { id?: string }): Promise<ResponsesJson> {
  if (!created.id) throw new Error("OpenAI did not return a response id");
  const started = Date.now();
  let current: ResponsesJson = created;
  while (current.status === "queued" || current.status === "in_progress") {
    if (Date.now() - started > MAX_WAIT_MS) throw new Error("Model run timed out after 40 minutes");
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    current = await openaiRequest<ResponsesJson>("GET", `/responses/${created.id}`);
  }
  if (current.status !== "completed" && current.status !== "incomplete") {
    throw new Error(`Model run ${current.status}: ${current.error?.message ?? "no detail"}`);
  }
  return current;
}

export function outputText(data: ResponsesJson): string {
  if (data.output_text?.trim()) return data.output_text;
  for (const item of data.output ?? []) {
    for (const part of item.content ?? []) {
      if ((part.type === "output_text" || part.type === "text") && part.text?.trim()) return part.text;
    }
  }
  const reason = data.incomplete_details?.reason ?? data.error?.message ?? data.status ?? "no output";
  throw new Error(`Model returned no text (${reason})`);
}

/** Pull the JSON object out of a reply (tolerates ```json fences or stray prose). */
function parseJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`Model reply had no JSON object: ${text.slice(0, 300)}`);
  return JSON.parse(text.slice(start, end + 1));
}

/** One Responses API call with optional live web search; returns the parsed JSON object. */
export async function askJson(opts: {
  task: AgentTask;
  instructions: string;
  input: string;
  webSearch?: boolean;
  maxOutputTokens?: number;
}): Promise<unknown> {
  const config = taskConfig(opts.task);
  const created = await openaiPost<ResponsesJson & { id?: string }>("/responses", {
    background: true,
    model: config.model,
    reasoning: { effort: config.effort },
    instructions: opts.instructions,
    input: opts.input,
    ...(opts.webSearch ? { tools: [{ type: "web_search", search_context_size: config.search }] } : {}),
    max_output_tokens: opts.maxOutputTokens ?? 32_000,
  });
  const data = await awaitResponse(created);
  logUsage(opts.task, config.model, data.usage);
  if (data.error?.message) throw new Error(`OpenAI error: ${data.error.message}`);
  return parseJsonObject(outputText(data));
}

export const IMAGE_SIZES = { landscape: { width: 1536, height: 1024 }, square: { width: 1024, height: 1024 } } as const;
export type ImageShape = keyof typeof IMAGE_SIZES;

/** Generate one WebP image; returns base64 plus its pixel size. */
export async function generateImage(prompt: string, shape: ImageShape, kind: "hero" | "inline") {
  const { width, height } = IMAGE_SIZES[shape];
  const data = await openaiPost<{ data?: Array<{ b64_json?: string }> }>("/images/generations", {
    model: imageModel(kind),
    prompt,
    size: `${width}x${height}`,
    quality: process.env.BLOG_AGENT_IMAGE_QUALITY?.trim() || "medium",
    output_format: "webp",
    output_compression: 82,
  });
  const base64 = data.data?.[0]?.b64_json;
  if (!base64) throw new Error("Image model returned no image");
  return { base64, width, height };
}
