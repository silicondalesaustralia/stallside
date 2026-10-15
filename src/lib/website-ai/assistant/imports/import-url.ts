import type { BriefImportSource } from "../brief/schema";
import { callStructured } from "../ai/client";
import { importRequest } from "../ai/requests";
import { extractPage, isSocialHost } from "./extract";
import { fetchPublicPage } from "./safe-fetch";

export type ImportOutcome = { source: BriefImportSource; message: string | null };

const SOCIAL_FALLBACK =
  "Social pages usually hide their details from other websites. Paste your bio or a few posts into the box below instead.";

/** Reads one public page and proposes facts. Nothing is used until the seller accepts it. */
export async function importFromUrl(raw: string): Promise<ImportOutcome> {
  const importedAt = new Date().toISOString();
  const base = { url: raw.trim().slice(0, 2048), facts: [], photoUrls: [], importedAt };
  const page = await fetchPublicPage(raw);
  if (!page.ok) {
    const social = isSocialHost(base.url) || isSocialHost(`https://${base.url}`);
    return {
      source: { ...base, status: page.blocked ? "blocked" : "unreadable" },
      message: social ? SOCIAL_FALLBACK : page.reason,
    };
  }
  const extracted = extractPage(page.html, page.finalUrl);
  if (extracted.text.length < 80) {
    return {
      source: { ...base, url: page.finalUrl, status: "unreadable", title: extracted.title ?? undefined },
      message: isSocialHost(page.finalUrl) ? SOCIAL_FALLBACK : "We couldn't find readable text on that page.",
    };
  }
  const result = await callStructured(importRequest(page.finalUrl, extracted.text));
  if (result.status !== "completed") {
    if (result.status === "error") console.error("[website-ai] import facts failed", result.code, result.message);
    return {
      source: { ...base, url: page.finalUrl, status: "unreadable", title: extracted.title ?? undefined, photoUrls: extracted.photoUrls },
      message: "We read the page but couldn't pick out details. Paste the important parts below instead.",
    };
  }
  const facts = result.data.facts
    .filter((f) => f.value.trim().length > 0)
    .slice(0, 12)
    .map((f) => ({ field: f.field, value: f.value.trim().slice(0, 1000), accepted: false }));
  return {
    source: { ...base, url: page.finalUrl, status: "ok", title: extracted.title ?? undefined, facts, photoUrls: extracted.photoUrls },
    message: facts.length === 0 ? "We didn't find any clear business details on that page." : null,
  };
}
