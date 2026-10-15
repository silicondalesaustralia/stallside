import type { z } from "zod";
import { callStructured, retrieveStructured, type StructuredRequest } from "./client";
import type { AiCallResult } from "./result";

const POLL_INTERVAL_MS = 2_500;
const POLL_MARGIN_MS = 4_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backgroundUnsupported<T>(result: AiCallResult<T>): boolean {
  return result.status === "error" && result.code === "provider" && /background/i.test(result.message);
}

/**
 * Submits (or resumes) a background structured call and polls until it finishes or the
 * budget runs out. A `pending` result carries the response ID to persist and resume later.
 */
export async function runStructuredWithinBudget<S extends z.ZodType>(
  req: StructuredRequest<S>,
  pendingResponseId: string | null,
  budgetMs: number,
): Promise<AiCallResult<z.infer<S>>> {
  const deadline = Date.now() + budgetMs;
  let result = pendingResponseId
    ? await retrieveStructured(pendingResponseId, req.schema)
    : await callStructured({ ...req, background: true });
  if (!pendingResponseId && backgroundUnsupported(result)) {
    result = await callStructured({ ...req, background: false });
  }
  while (result.status === "pending" && Date.now() + POLL_INTERVAL_MS + POLL_MARGIN_MS < deadline) {
    await sleep(POLL_INTERVAL_MS);
    result = await retrieveStructured(result.responseId, req.schema);
  }
  return result;
}
