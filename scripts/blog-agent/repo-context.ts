import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

const ROOT = process.cwd();
const FACT_FILES = ["src/lib/plan-copy.ts", "src/lib/pricing-model.ts", "src/lib/constants.ts"];

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Checkout of the upcoming release (BLOG_AGENT_CONTEXT_DIR, e.g. feature/social-kit) that product
 * facts and the knowledge base are read from; falls back to this checkout when it is missing.
 */
export function productContextRoot(): string {
  const dir = process.env.BLOG_AGENT_CONTEXT_DIR?.trim();
  const root = dir ? resolve(ROOT, dir) : ROOT;
  return existsSync(join(root, "src/lib/knowledge-base/index.ts")) ? root : ROOT;
}

/** Which branch the product context came from, for source labels. */
export function productContextLabel(): string {
  return productContextRoot() === ROOT ? "this checkout" : process.env.BLOG_AGENT_CONTEXT_REF?.trim() || "upcoming release";
}

function labelled(relative: string): string {
  const fromContext = join(productContextRoot(), relative);
  const text = existsSync(fromContext) ? readFileSync(fromContext, "utf8") : read(relative);
  return `===== ${relative} (${productContextLabel()}) =====\n${text}`;
}

export function agentDoc(name: "PLAYBOOK" | "WRITING"): string {
  return read(`docs/blog-agent/${name}.md`);
}

const SECTIONS_SKIPPED_BY: Record<"PLAN" | "WRITE", RegExp> = {
  PLAN: /^## (Writer|Images|Output rules)/,
  WRITE: /^## Planner/,
};

/** The playbook without the sections the other stage needs. */
export function playbookFor(stage: "PLAN" | "WRITE"): string {
  return agentDoc("PLAYBOOK")
    .split(/\n(?=## )/)
    .filter((section) => !SECTIONS_SKIPPED_BY[stage].test(section))
    .join("\n");
}

/** Pricing, plan and fee source files: the only source of truth for Vendl numbers. */
export function vendlFactsSource(): string {
  return FACT_FILES.map(labelled).join("\n\n");
}

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

const MAX_COMMITS = 40;

/** Recent commit subjects (no bodies) on shipped (main) and upcoming (preview) branches. */
export function recentCommits(days = 7): { shipped: string; upcoming: string } {
  const range = [`--since=${days} days ago`, "--no-merges", `--max-count=${MAX_COMMITS}`, "--pretty=format:%ad %s", "--date=short"];
  const upcomingRef = process.env.BLOG_AGENT_PREVIEW_REF?.trim() || "origin/feature/social-kit";
  return {
    shipped: git(["log", "origin/main", ...range]),
    upcoming: git(["log", upcomingRef, "--not", "origin/main", ...range]),
  };
}

export function adelaideHour(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Adelaide", hour: "numeric", hourCycle: "h23" }).format(now),
  );
}

export function adelaideWeekday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Adelaide", weekday: "long" }).format(now);
}

export function todayInAdelaide(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Adelaide" }).format(now);
}
