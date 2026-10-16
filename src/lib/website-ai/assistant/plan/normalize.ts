import type { ModelSectionType, PlannedPage, SitePlan } from "../ai/schemas";
import type { PageTarget } from "./targets";
import { LEADING_SECTIONS, SINGLETON_SECTIONS } from "./section-rules";

export type PlannedSection = { type: ModelSectionType; purpose: string };

export type NormalizedPage = {
  target: PageTarget;
  title: string;
  navLabel: string;
  purpose: string;
  sections: PlannedSection[];
};

export type NormalizedPlan = {
  summary: string;
  pages: NormalizedPage[];
  unsupported: { request: string; reason: string }[];
  missingFacts: string[];
  /** Where the plan was corrected; recorded on the job, never hidden. */
  corrections: string[];
};

const POLICY_SECTIONS: PlannedSection[] = [
  { type: "text", purpose: "Overview and who this policy applies to" },
  { type: "text", purpose: "The main commitments, using only confirmed facts" },
  { type: "text", purpose: "How customers can contact the business about this policy" },
];

function clip(value: string, max: number, fallback: string): string {
  const v = value.trim().replace(/\s+/g, " ");
  return (v || fallback).slice(0, max);
}

function fixSections(page: PlannedPage | undefined, target: PageTarget, notes: string[]): PlannedSection[] {
  const allowed = new Set(target.allowedSections);
  const seen = new Set<ModelSectionType>();
  const out: PlannedSection[] = [];
  const source = page?.sections ?? target.defaultSections.map((type) => ({ type, purpose: "" }));
  for (const s of source) {
    if (!allowed.has(s.type)) {
      notes.push(`${target.key}: removed unavailable section ${s.type}`);
      continue;
    }
    if (SINGLETON_SECTIONS.has(s.type) && seen.has(s.type)) continue;
    if (LEADING_SECTIONS.has(s.type) && out.length > 0) continue;
    seen.add(s.type);
    out.push({ type: s.type, purpose: clip(s.purpose, 300, "") });
  }
  for (const req of target.requiredSections) {
    if (seen.has(req)) continue;
    notes.push(`${target.key}: added required section ${req}`);
    const entry = { type: req, purpose: "" };
    if (LEADING_SECTIONS.has(req)) out.unshift(entry);
    else out.push(entry);
  }
  if (out.length > target.maxSections) {
    const required = new Set(target.requiredSections);
    const kept = out.filter((s, i) => required.has(s.type) || i < target.maxSections);
    out.splice(0, out.length, ...kept.slice(0, Math.max(target.maxSections, target.requiredSections.length)));
  }
  if (out.length === 0) return target.defaultSections.map((type) => ({ type, purpose: "" }));
  return out;
}

/** Turns model output (or nothing) into a complete, valid page plan for every selected page. */
export function normalizePlan(plan: SitePlan | null, targets: PageTarget[]): NormalizedPlan {
  const corrections: string[] = [];
  const byKey = new Map((plan?.pages ?? []).map((p) => [p.key, p]));
  const pages = targets.map((target): NormalizedPage => {
    const page = byKey.get(target.key);
    if (!page && target.kind !== "policy") corrections.push(`${target.key}: page missing from plan, used defaults`);
    return {
      target,
      title: clip(page?.title ?? "", 60, target.title),
      navLabel: clip(page?.navLabel ?? "", 24, target.navLabel),
      purpose: clip(page?.purpose ?? "", 300, target.purpose),
      sections: target.kind === "policy" ? POLICY_SECTIONS : fixSections(page, target, corrections),
    };
  });
  return {
    summary: clip(plan?.siteSummary ?? "", 400, ""),
    pages,
    unsupported: (plan?.unsupported ?? []).slice(0, 10).map((u) => ({
      request: clip(u.request, 200, "Request"),
      reason: clip(u.reason, 300, "Not supported by the website builder yet."),
    })),
    missingFacts: (plan?.missingFacts ?? []).slice(0, 10).map((m) => clip(m, 200, "")).filter(Boolean),
    corrections,
  };
}
