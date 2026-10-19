/** Client for the app's token-protected /api/blog-agent/* endpoints. */

function env(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const base = env("BLOG_AGENT_BASE_URL").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/blog-agent${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env("BLOG_AGENT_TOKEN")}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 2000);
    throw new Error(`${method} ${path} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

export function appGet<T>(path: string): Promise<T> {
  return call<T>("GET", path);
}

export function appPost<T>(path: string, body: unknown): Promise<T> {
  return call<T>("POST", path, body);
}

/** Best-effort failure email; never throws (the run is already failing). */
export async function reportFailure(subject: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const runUrl = process.env.GITHUB_RUN_URL ?? "";
  try {
    await appPost("/digest", {
      subject,
      summaryHtml: `<p>${message.replace(/[<>&]/g, " ").slice(0, 3000)}</p>${runUrl ? `<p><a href="${runUrl}">GitHub Actions run log</a></p>` : ""}`,
    });
  } catch (sendError) {
    console.error("Could not send failure email", sendError);
  }
}
