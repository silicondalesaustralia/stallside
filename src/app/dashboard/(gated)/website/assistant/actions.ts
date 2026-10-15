"use server";

import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { requireAssistantOwner } from "@/lib/website-ai/assistant/load-wizard";
import { saveBrief } from "@/lib/website-ai/assistant/brief/store";
import { briefDataSchema, type BriefData } from "@/lib/website-ai/assistant/brief/schema";
import { buildAssistantContext } from "@/lib/website-ai/assistant/context/build";
import { factsForPrompt } from "@/lib/website-ai/assistant/ai/facts";
import { followUpRequest } from "@/lib/website-ai/assistant/ai/requests";
import { callStructured } from "@/lib/website-ai/assistant/ai/client";
import { pageOptions, type PageOption } from "@/lib/website-ai/assistant/pages/catalogue";
import { importFromUrl, type ImportOutcome } from "@/lib/website-ai/assistant/imports/import-url";

export type SaveBriefResult =
  | { ok: true; revision: number; pageOptions: PageOption[] }
  | { ok: false; error: string };

async function assistantContextFor(ownerId: string, slug: string) {
  const ctx = await loadStorefrontContext(slug, { draft: true, ownerId });
  if (!ctx) throw new Error("Storefront context unavailable");
  return buildAssistantContext(ctx);
}

/** Saves the wizard brief (never the website draft) and returns refreshed page recommendations. */
export async function saveBriefAction(expectedRevision: number, data: BriefData): Promise<SaveBriefResult> {
  try {
    const { owner, storefront } = await requireAssistantOwner();
    const parsed = briefDataSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
    const saved = await saveBrief({ ownerId: owner.id, storefrontId: storefront.id, expectedRevision, data: parsed.data });
    if (!saved.ok) return { ok: false, error: saved.message };
    const ctx = await assistantContextFor(owner.id, storefront.slug);
    return { ok: true, revision: saved.revision, pageOptions: pageOptions(ctx, parsed.data) };
  } catch (err) {
    console.error("[website-ai] save brief failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not save your details. Please try again." };
  }
}

export type ImportResult = { ok: true; outcome: ImportOutcome } | { ok: false; error: string };

/** Reads a public website or social page; facts stay proposals until the seller accepts them. */
export async function importUrlAction(url: string): Promise<ImportResult> {
  try {
    await requireAssistantOwner();
    if (!url.trim()) return { ok: false, error: "Enter a web address." };
    return { ok: true, outcome: await importFromUrl(url) };
  } catch (err) {
    console.error("[website-ai] import failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not read that page. Please try again." };
  }
}

export type FollowUpResult =
  | { ok: true; questions: { id: string; question: string }[] }
  | { ok: false; error: string };

/** Up to three questions about material missing facts. No chat. */
export async function followUpsAction(data: BriefData): Promise<FollowUpResult> {
  try {
    const { owner, storefront } = await requireAssistantOwner();
    const parsed = briefDataSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: "Check your details first." };
    const ctx = await assistantContextFor(owner.id, storefront.slug);
    const result = await callStructured(followUpRequest(factsForPrompt(ctx, parsed.data)));
    if (result.status !== "completed") {
      if (result.status === "error") console.error("[website-ai] follow-ups failed", result.code, result.message);
      return { ok: true, questions: [] };
    }
    console.info("[website-ai] follow-ups usage", owner.id, result.usage);
    const questions = result.data.questions
      .slice(0, 3)
      .map((q) => ({ id: q.id.slice(0, 40), question: q.question.slice(0, 160) }))
      .filter((q) => q.id && q.question);
    return { ok: true, questions };
  } catch (err) {
    console.error("[website-ai] follow-ups crashed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not load follow-up questions." };
  }
}
