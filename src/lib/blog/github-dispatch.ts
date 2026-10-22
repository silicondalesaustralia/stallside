import { cleanEnvSecret } from "@/lib/env";

const DEFAULT_REPO = "silicondalesaustralia/stallside";

/**
 * Start a GitHub Actions workflow. The workflow file must exist on the repo's default branch;
 * BLOG_AGENT_GIT_REF picks the branch whose code it runs.
 */
async function dispatchWorkflow(workflow: string, inputs: Record<string, string>): Promise<void> {
  const token = cleanEnvSecret(process.env.GITHUB_DISPATCH_TOKEN);
  if (!token) throw new Error("GITHUB_DISPATCH_TOKEN is not set, so the blog agent cannot be started");
  const repo = cleanEnvSecret(process.env.BLOG_AGENT_GITHUB_REPO) ?? DEFAULT_REPO;
  const ref = cleanEnvSecret(process.env.BLOG_AGENT_GIT_REF) ?? "main";

  const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`GitHub dispatch of ${workflow} failed (${res.status}): ${detail}`);
  }
}

/** Writer for one picked topic. */
export function dispatchBlogWrite(topicId: string): Promise<void> {
  return dispatchWorkflow("blog-write.yml", { topic_id: topicId });
}

/** Evening planner; GitHub's own schedule runs hours late, so the app's cron starts it. */
export function dispatchBlogPlan(): Promise<void> {
  return dispatchWorkflow("blog-plan.yml", {});
}
