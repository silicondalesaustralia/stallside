import { cleanEnvSecret } from "@/lib/env";

const DEFAULT_REPO = "silicondalesaustralia/stallside";
const WRITE_WORKFLOW = "blog-write.yml";

/**
 * Start the GitHub Actions writer for one topic. The workflow file must exist on the
 * repo's default branch; BLOG_AGENT_GIT_REF picks the branch whose code it runs.
 */
export async function dispatchBlogWrite(topicId: string): Promise<void> {
  const token = cleanEnvSecret(process.env.GITHUB_DISPATCH_TOKEN);
  if (!token) throw new Error("GITHUB_DISPATCH_TOKEN is not set, so the writer cannot be started");
  const repo = cleanEnvSecret(process.env.BLOG_AGENT_GITHUB_REPO) ?? DEFAULT_REPO;
  const ref = cleanEnvSecret(process.env.BLOG_AGENT_GIT_REF) ?? "main";

  const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${WRITE_WORKFLOW}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs: { topic_id: topicId } }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`GitHub dispatch failed (${res.status}): ${detail}`);
  }
}
