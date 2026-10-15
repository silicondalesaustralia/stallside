import type { StructuredRequest } from "./client";
import {
  followUpSchema,
  importFactsSchema,
  pageContentSchema,
  sitePlanSchema,
} from "./schemas";
import type { PromptFacts } from "./facts";
import {
  FOLLOW_UP_INSTRUCTIONS,
  IMPORT_INSTRUCTIONS,
  PAGE_INSTRUCTIONS,
  PLAN_INSTRUCTIONS,
  POLICY_INSTRUCTIONS,
} from "./prompts";
import type { NormalizedPage, NormalizedPlan } from "../plan/normalize";
import type { PageTarget } from "../plan/targets";

export const PLAN_MAX_TOKENS = 6_000;
export const PAGE_MAX_TOKENS = 5_000;

export function planRequest(facts: PromptFacts, targets: PageTarget[]): StructuredRequest<typeof sitePlanSchema> {
  const pages = targets
    .filter((t) => t.kind !== "policy")
    .map((t) => ({
      key: t.key,
      title: t.title,
      purpose: t.purpose,
      allowedSections: t.allowedSections,
      requiredSections: t.requiredSections,
      maxSections: t.maxSections,
    }));
  return {
    schema: sitePlanSchema,
    name: "vendl_site_plan",
    instructions: PLAN_INSTRUCTIONS,
    input: JSON.stringify({ facts, pages }),
    maxOutputTokens: PLAN_MAX_TOKENS,
  };
}

/** One page-writing task. Shares the site outline so pages stay consistent. */
export function pageRequest(
  facts: PromptFacts,
  page: NormalizedPage,
  plan: NormalizedPlan,
  imageSections: number[],
): StructuredRequest<typeof pageContentSchema> {
  const outline = plan.pages.map((p) => ({ key: p.target.key, title: p.title, purpose: p.purpose }));
  const sections = page.sections.map((s, index) => ({
    index,
    type: s.type,
    purpose: s.purpose,
    hasImage: imageSections.includes(index),
  }));
  return {
    schema: pageContentSchema,
    name: "vendl_page_copy",
    instructions: page.target.kind === "policy" ? POLICY_INSTRUCTIONS : PAGE_INSTRUCTIONS,
    input: JSON.stringify({
      facts,
      siteSummary: plan.summary,
      siteOutline: outline,
      page: { key: page.target.key, title: page.title, purpose: page.purpose, sections },
    }),
    maxOutputTokens: PAGE_MAX_TOKENS,
  };
}

export function followUpRequest(facts: PromptFacts): StructuredRequest<typeof followUpSchema> {
  return {
    schema: followUpSchema,
    name: "vendl_follow_ups",
    instructions: FOLLOW_UP_INSTRUCTIONS,
    input: JSON.stringify({ facts }),
    maxOutputTokens: 1_500,
  };
}

export function importRequest(url: string, pageText: string): StructuredRequest<typeof importFactsSchema> {
  return {
    schema: importFactsSchema,
    name: "vendl_import_facts",
    instructions: IMPORT_INSTRUCTIONS,
    input: JSON.stringify({ sourceUrl: url, untrustedPageText: pageText.slice(0, 12_000) }),
    maxOutputTokens: 1_500,
  };
}
