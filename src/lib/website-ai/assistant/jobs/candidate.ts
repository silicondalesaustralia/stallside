import type { BusinessMode } from "@/lib/business-mode";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";
import { basicPageContent } from "../fallback/basic-copy";
import { chooseDesign } from "../compile/design";
import { assignPageImages, buildImagePool } from "../compile/images";
import { compilePage, type CompiledPage } from "../compile/page";
import { allocatePages } from "../compile/allocate";
import { assembleCandidate, type Candidate } from "../compile/draft";
import { shopSelected } from "../plan/targets";
import type { NormalizedPlan } from "../plan/normalize";
import type { JobState } from "./state";

export type CandidateBuild =
  | { ok: true; candidate: Candidate; notes: string[] }
  | { ok: false; errors: string[] };

function primaryLink(ctx: AssistantContext, brief: BriefData, plan: NormalizedPlan, baseDraft: unknown): string | undefined {
  const goal = brief.business.primaryGoal;
  const selected = new Set(brief.pages.selected);
  if ((goal === "sell_online" || goal === "pre_orders" || goal === "subscriptions") && shopSelected(ctx, brief)) {
    return "page:shop";
  }
  if (goal === "local_visits" && selected.has("VISIT")) {
    const { allocations } = allocatePages(ensureCustomPages(baseDraft), plan.pages);
    const visit = allocations.find((a) => a.key === "VISIT");
    if (visit?.slug) return `nav:${visit.slug}`;
  }
  if (selected.has("CONTACT")) return "page:contact";
  return undefined;
}

/** Pure: rebuilds the candidate from saved job state against the given base draft. */
export function buildCandidate(input: {
  ctx: AssistantContext;
  businessMode: BusinessMode;
  brief: BriefData;
  state: JobState;
  baseDraft: unknown;
}): CandidateBuild {
  const { ctx, brief, state } = input;
  if (!state.plan) return { ok: false, errors: ["The page plan is missing."] };
  const design = chooseDesign(ctx, brief);
  const pool = buildImagePool(ctx, brief, state.decorative ?? null);
  const cursor = { next: 0 };
  const link = primaryLink(ctx, brief, state.plan, input.baseDraft);
  const productIds = ctx.catalogue.products.slice(0, 8).map((p) => p.id);
  const notes: string[] = [];
  const compiled: Record<string, CompiledPage> = {};
  const kept = state.plan.pages.filter((page) => {
    const images = assignPageImages(page, pool, cursor);
    const base = { page, design, businessMode: input.businessMode, images, primaryLink: link, productIds };
    const aiContent = state.contents?.[page.target.key] ?? null;
    let result = compilePage({ ...base, content: aiContent ?? basicPageContent(ctx, brief, page) });
    if (result.errors.length > 0 && aiContent) {
      notes.push(`${page.title} used starter copy because the AI copy did not pass checks.`);
      result = compilePage({ ...base, content: basicPageContent(ctx, brief, page) });
    }
    if (result.errors.length > 0) {
      notes.push(`${page.title} was left out: ${result.errors[0]}`);
      return false;
    }
    compiled[page.target.key] = result;
    return true;
  });
  if (!kept.some((p) => p.target.kind === "home")) {
    return { ok: false, errors: notes.length > 0 ? notes : ["The homepage could not be built."] };
  }
  const plan = { ...state.plan, pages: kept };
  const candidate = assembleCandidate({
    baseDraft: input.baseDraft,
    ctx,
    brief,
    design,
    plan,
    compiled,
    heroImageUrl: pool.sellerHero,
  });
  return { ok: true, candidate, notes };
}
