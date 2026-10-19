import type { AgentArticle } from "./article-schema";

const SITE_HOST = /^https?:\/\/(www\.)?vendl\.app(?=\/|$)/i;
const CONCURRENCY = 5;
const MAX_SUMMARY = 2000;

function internalPath(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (SITE_HOST.test(href)) return href.replace(SITE_HOST, "") || "/";
  return null;
}

function hrefsIn(html: string): string[] {
  return [...new Set([...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]))];
}

/** "missing" only for a definite 404/410; network or server errors keep the link (and are logged). */
async function pageStatus(base: string, path: string): Promise<"ok" | "missing"> {
  try {
    const res = await fetch(`${base}${path.split("#")[0]}`, { redirect: "follow" });
    if (res.status === 404 || res.status === 410) return "missing";
    if (!res.ok) console.error(`Link check ${path}: HTTP ${res.status}; keeping link`);
    return "ok";
  } catch (error) {
    console.error(`Link check ${path} failed; keeping link`, error);
    return "ok";
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unlink(html: string, href: string): string {
  return html.replace(new RegExp(`<a\\b[^>]*\\bhref="${escapeRegExp(href)}"[^>]*>([\\s\\S]*?)</a>`, "gi"), "$1");
}

/** Remove internal links that point to pages that don't exist; note them in agentSummary. */
export async function fixInternalLinks(article: AgentArticle): Promise<AgentArticle> {
  const base = process.env.BLOG_AGENT_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) return article;
  const internal = hrefsIn(article.bodyHtml)
    .map((href) => ({ href, path: internalPath(href) }))
    .filter((link): link is { href: string; path: string } => link.path !== null);

  const broken: string[] = [];
  for (let i = 0; i < internal.length; i += CONCURRENCY) {
    const batch = internal.slice(i, i + CONCURRENCY);
    const statuses = await Promise.all(batch.map((link) => pageStatus(base, link.path)));
    batch.forEach((link, index) => statuses[index] === "missing" && broken.push(link.href));
  }
  console.log(`Checked ${internal.length} internal links; ${broken.length} broken`);
  if (broken.length === 0) return article;

  const bodyHtml = broken.reduce(unlink, article.bodyHtml);
  const note = ` Link check removed ${broken.length} broken internal link(s): ${broken.join(", ")}.`;
  return { ...article, bodyHtml, agentSummary: `${article.agentSummary}${note}`.slice(0, MAX_SUMMARY) };
}
