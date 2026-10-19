import type { AiCitation, AiVisibilityResult } from "../../src/lib/blog/ai-visibility-schema";
import { AI_VISIBILITY_QUESTIONS } from "./ai-questions";
import { appPost } from "./api";
import { COMPETITORS } from "./competitor-scan";
import { awaitResponse, openaiPost, outputText, type ResponsesJson } from "./openai";

const ENGINE = "chatgpt";
const CONCURRENCY = 4;
const VENDL_DOMAINS = ["vendl.app"];

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function citationsOf(data: ResponsesJson): AiCitation[] {
  const seen = new Map<string, AiCitation>();
  for (const item of data.output ?? []) {
    for (const part of item.content ?? []) {
      for (const note of part.annotations ?? []) {
        if (note.type !== "url_citation" || !note.url) continue;
        const url = note.url.replace(/[?&]utm_source=openai$/, "");
        if (!seen.has(url)) seen.set(url, { url, title: note.title ?? null, domain: domainOf(url) });
      }
    }
  }
  return [...seen.values()].slice(0, 40);
}

/** Ask like a shopper would: no system prompt, web search on, Australian location. */
async function askAsShopper(question: string): Promise<AiVisibilityResult> {
  const created = await openaiPost<ResponsesJson & { id?: string }>("/responses", {
    background: true,
    model: process.env.BLOG_AGENT_VISIBILITY_MODEL?.trim() || process.env.BLOG_AGENT_MODEL?.trim() || "gpt-6-astra",
    reasoning: { effort: "low" },
    input: question,
    tools: [{ type: "web_search", user_location: { type: "approximate", country: "AU" } }],
    max_output_tokens: 4_000,
  });
  const data = await awaitResponse(created);
  const text = outputText(data);
  const citations = citationsOf(data);
  const lower = text.toLowerCase();
  return {
    engine: ENGINE,
    question,
    answerExcerpt: text.slice(0, 4000),
    vendlMentioned: /\bvendl\b/i.test(text),
    vendlCited: citations.some((c) => VENDL_DOMAINS.some((d) => c.domain === d || c.domain.endsWith(`.${d}`))),
    competitorsMentioned: COMPETITORS.filter((name) => lower.includes(name.toLowerCase())),
    citations,
  };
}

async function inPool<T, R>(items: readonly T[], size: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return results;
}

/** Weekly ChatGPT check: store results for the admin trend, return a compact summary for the planner. */
export async function runAiVisibilityCheck() {
  try {
    const settled = await inPool(AI_VISIBILITY_QUESTIONS, CONCURRENCY, (q) =>
      askAsShopper(q).catch((error: unknown) => {
        console.error(`AI visibility question failed: ${q}`, error);
        return null;
      }),
    );
    const results = settled.filter((r): r is AiVisibilityResult => r !== null);
    if (results.length === 0) return null;
    await appPost("/ai-visibility", { runAt: new Date().toISOString(), results });
    return results.map((r) => ({
      question: r.question,
      vendlMentioned: r.vendlMentioned,
      vendlCited: r.vendlCited,
      competitorsMentioned: r.competitorsMentioned,
      citedPages: r.citations.slice(0, 6).map((c) => ({ url: c.url, title: c.title })),
    }));
  } catch (error) {
    console.error("AI visibility check failed; planning without it", error);
    return null;
  }
}
