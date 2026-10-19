import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const FACT_FILES = ["src/lib/plan-copy.ts", "src/lib/pricing-model.ts", "src/lib/constants.ts"];
const KB_DIR = "src/lib/knowledge-base";

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function labelled(relative: string): string {
  return `===== ${relative} =====\n${read(relative)}`;
}

export function agentDoc(name: "PLAYBOOK" | "WRITING"): string {
  return read(`docs/blog-agent/${name}.md`);
}

/** Knowledge base article sources (Vendl feature facts as shipped on this checkout). */
export function knowledgeBaseSource(): string {
  return readdirSync(join(ROOT, KB_DIR))
    .filter((file) => file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts")
    .map((file) => labelled(`${KB_DIR}/${file}`))
    .join("\n\n");
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

/** Recent commit subjects on shipped (main) and upcoming (preview) branches. */
export function recentCommits(days = 7): { shipped: string; upcoming: string } {
  const since = `--since=${days} days ago`;
  const upcomingRef = process.env.BLOG_AGENT_PREVIEW_REF?.trim() || "origin/feature/social-kit";
  return {
    shipped: git(["log", "origin/main", since, "--no-merges", "--pretty=format:%h %ad %s", "--date=short"]),
    upcoming: git(["log", upcomingRef, "--not", "origin/main", since, "--no-merges", "--pretty=format:%h %ad %s", "--date=short"]),
  };
}

export function adelaideHour(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Adelaide", hour: "numeric", hourCycle: "h23" }).format(now),
  );
}

export function todayInAdelaide(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Adelaide" }).format(now);
}
