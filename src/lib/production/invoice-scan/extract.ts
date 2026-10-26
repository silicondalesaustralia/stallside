import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { cleanEnvSecret } from "@/lib/env";
import { INVOICE_SYSTEM_PROMPT, invoiceUserPrompt } from "./prompt";
import { scannedInvoiceSchema, scannedLineSchema, type ScannedInvoice, type ScannedLine } from "./schema";

export type ExtractedInvoice = Omit<ScannedInvoice, "lines"> & { lines: ScannedLine[] };
export type ScanUsage = { inputTokens: number; cachedInputTokens: number; outputTokens: number };
export type ExtractResult =
  | { ok: true; invoice: ExtractedInvoice; model: string; usage: ScanUsage }
  | { ok: false; error: string; model: string; usage: ScanUsage | null };

export function invoiceScanModel(): string {
  return process.env.INVOICE_SCAN_MODEL?.trim() || "gpt-4o";
}

function documentPart(file: { mimeType: string; base64: string; name: string }): ChatCompletionContentPart {
  const dataUrl = `data:${file.mimeType};base64,${file.base64}`;
  if (file.mimeType === "application/pdf") {
    return { type: "file", file: { filename: file.name || "invoice.pdf", file_data: dataUrl } };
  }
  return { type: "image_url", image_url: { url: dataUrl, detail: "high" } };
}

function parseInvoice(raw: string): ExtractedInvoice | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = scannedInvoiceSchema.safeParse(json);
  if (!parsed.success) return null;
  const lines = parsed.data.lines.flatMap((line) => {
    const result = scannedLineSchema.safeParse(line);
    return result.success ? [result.data] : [];
  });
  return { ...parsed.data, lines };
}

/** Sends one invoice image or PDF to the vision model and returns validated line items. */
export async function extractInvoice(
  file: { mimeType: string; base64: string; name: string },
  hint: { currency: string; taxLabel: string },
): Promise<ExtractResult> {
  const model = invoiceScanModel();
  const apiKey = cleanEnvSecret(process.env.OPENAI_API_KEY);
  if (!apiKey) return { ok: false, error: "Invoice scanning isn't configured yet.", model, usage: null };

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    max_completion_tokens: 4000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: INVOICE_SYSTEM_PROMPT },
      { role: "user", content: [{ type: "text", text: invoiceUserPrompt(hint) }, documentPart(file)] },
    ],
  });

  const usage: ScanUsage = {
    inputTokens: response.usage?.prompt_tokens ?? 0,
    cachedInputTokens: response.usage?.prompt_tokens_details?.cached_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };
  const invoice = parseInvoice(response.choices[0]?.message?.content?.trim() ?? "");
  if (!invoice) {
    console.warn("[invoice-scan] unreadable model output", response.id);
    return { ok: false, error: "Couldn't read that document. Try a clearer photo.", model, usage };
  }
  if (!invoice.isInvoice || invoice.lines.length === 0) {
    return { ok: false, error: "No purchased items found. Is this an invoice or receipt?", model, usage };
  }
  return { ok: true, invoice, model, usage };
}
