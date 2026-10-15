import { factsForPrompt } from "../ai/facts";
import { pageRequest, planRequest } from "../ai/requests";
import { runStructuredWithinBudget } from "../ai/run";
import type { AiCallResult } from "../ai/result";
import { buildImagePool, assignPageImages } from "../compile/images";
import { normalizePlan } from "../plan/normalize";
import { pageTargets } from "../plan/targets";
import { MAX_ATTEMPTS } from "./lease";
import type { StepInput, StepOutcome } from "./outcome";
import { addNote, type JobState } from "./state";

const FATAL = new Set(["auth", "unsupported_model", "not_configured"]);

function onError<T>(
  input: StepInput,
  result: Extract<AiCallResult<T>, { status: "error" }>,
  fallback: (state: JobState) => StepOutcome,
): StepOutcome {
  const state = { ...input.state, pending: undefined };
  if (FATAL.has(result.code)) {
    console.error("[website-ai] AI disabled for job", input.job.id, result.code, result.message);
    return fallback(addNote({ ...state, aiOff: true }, "AI writing was unavailable, so starter copy was used."));
  }
  if (result.retryable && input.job.attempts + 1 < MAX_ATTEMPTS) {
    return { kind: "retry", state, code: result.code, message: result.message, retryAfterMs: result.retryAfterMs, usage: result.usage };
  }
  console.error("[website-ai] AI step gave up", input.job.id, result.code, result.message);
  return fallback(addNote(state, "Some AI copy could not be written, so starter copy was used there."));
}

export async function planStep(input: StepInput): Promise<StepOutcome> {
  const { assistant: ctx } = input.context;
  const targets = pageTargets(ctx, input.brief);
  const fallback = (state: JobState): StepOutcome => ({
    kind: "next",
    stage: "images",
    state: { ...state, plan: normalizePlan(null, targets), contents: {} },
  });
  if (input.state.aiOff) return fallback(input.state);
  const pendingId = input.state.pending?.key === "plan" ? input.state.pending.responseId : null;
  const result = await runStructuredWithinBudget(
    planRequest(factsForPrompt(ctx, input.brief), targets),
    pendingId,
    input.budgetMs,
  );
  if (result.status === "pending") {
    return { kind: "wait", state: { ...input.state, pending: { key: "plan", responseId: result.responseId } } };
  }
  if (result.status === "error") return onError(input, result, fallback);
  const plan = normalizePlan(result.data, targets);
  let state: JobState = { ...input.state, pending: undefined, plan, contents: {} };
  if (plan.corrections.length > 0) state = addNote(state, `Adjusted the plan: ${plan.corrections.slice(0, 3).join("; ")}`);
  return { kind: "next", stage: "images", state, usage: result.usage, model: result.model };
}

/** Writes one page per step so each step fits the request budget. */
export async function pagesStep(input: StepInput): Promise<StepOutcome> {
  const { assistant: ctx } = input.context;
  const plan = input.state.plan;
  if (!plan) return { kind: "failed", code: "missing_plan", message: "The page plan is missing." };
  const contents = input.state.contents ?? {};
  const page = plan.pages.find((p) => !(p.target.key in contents));
  if (!page || input.state.aiOff) return { kind: "next", stage: "compile", state: input.state };

  const pool = buildImagePool(ctx, input.brief, input.state.decorative ?? null);
  const images = Object.keys(assignPageImages(page, pool, { next: 0 })).map(Number);
  const pendingId = input.state.pending?.key === page.target.key ? input.state.pending.responseId : null;
  const result = await runStructuredWithinBudget(
    pageRequest(factsForPrompt(ctx, input.brief), page, plan, images),
    pendingId,
    input.budgetMs,
  );
  const skip = (state: JobState): StepOutcome => ({
    kind: "next",
    stage: "pages",
    state: { ...state, contents: { ...contents, [page.target.key]: null } },
  });
  if (result.status === "pending") {
    return { kind: "wait", state: { ...input.state, pending: { key: page.target.key, responseId: result.responseId } } };
  }
  if (result.status === "error") return onError(input, result, skip);
  return {
    kind: "next",
    stage: "pages",
    state: { ...input.state, pending: undefined, contents: { ...contents, [page.target.key]: result.data } },
    usage: result.usage,
    model: result.model,
  };
}
