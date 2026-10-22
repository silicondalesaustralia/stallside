/**
 * Model, reasoning effort and web-search depth per agent task. The flagship model is reserved for the
 * article draft (where quality shows); planning uses the previous generation, and research extraction,
 * fact checks and the visibility check use a mini model.
 * Override any value with BLOG_AGENT_MODEL_<TASK>, BLOG_AGENT_EFFORT_<TASK>, BLOG_AGENT_SEARCH_<TASK>.
 */
export type AgentTask = "WRITE" | "PLAN" | "RESEARCH" | "VISIBILITY";
type Effort = "minimal" | "low" | "medium" | "high";
type SearchSize = "low" | "medium" | "high";

const DEFAULTS: Record<AgentTask, { model: string; effort: Effort; search: SearchSize }> = {
  WRITE: { model: "gpt-6-astra", effort: "medium", search: "medium" },
  PLAN: { model: "gpt-5.4", effort: "low", search: "low" },
  RESEARCH: { model: "gpt-5.4-mini", effort: "low", search: "medium" },
  VISIBILITY: { model: "gpt-5.4-mini", effort: "low", search: "low" },
};

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function taskConfig(task: AgentTask) {
  const d = DEFAULTS[task];
  return {
    model: env(`BLOG_AGENT_MODEL_${task}`) ?? d.model,
    effort: env(`BLOG_AGENT_EFFORT_${task}`) ?? d.effort,
    search: env(`BLOG_AGENT_SEARCH_${task}`) ?? d.search,
  };
}

/** Feature image gets the full model; inline images use the mini model. */
export function imageModel(kind: "hero" | "inline"): string {
  return env(`BLOG_AGENT_IMAGE_MODEL_${kind.toUpperCase()}`) ?? (kind === "hero" ? "gpt-image-1" : "gpt-image-1-mini");
}

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { cached_tokens?: number };
  output_tokens_details?: { reasoning_tokens?: number };
};

export function logUsage(task: AgentTask, model: string, usage: Usage | undefined): void {
  if (!usage) return;
  const cached = usage.input_tokens_details?.cached_tokens ?? 0;
  const reasoning = usage.output_tokens_details?.reasoning_tokens ?? 0;
  console.log(
    `[usage] ${task} ${model}: input ${usage.input_tokens ?? 0} (cached ${cached}), output ${usage.output_tokens ?? 0} (reasoning ${reasoning})`,
  );
}
