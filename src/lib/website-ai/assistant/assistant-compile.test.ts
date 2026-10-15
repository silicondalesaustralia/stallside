import { test } from "node:test";
import assert from "node:assert/strict";
import type { SerializedNodes } from "@craftjs/core";
import { buildCandidate } from "./jobs/candidate";
import { normalizePlan } from "./plan/normalize";
import { pageTargets } from "./plan/targets";
import { findPublishBlockers } from "@/lib/website/persistence/publish-checks";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import type { PageContent } from "./ai/schemas";
import { fixtureBrief, fixtureContext } from "./test-fixtures";
import type { JobState } from "./jobs/state";

const COMMERCE: SerializedNodes = {
  ROOT: { type: { resolvedName: "StudioRoot" }, isCanvas: true, props: {}, displayName: "Root", custom: {}, hidden: false, nodes: [], linkedNodes: {}, parent: null },
} as unknown as SerializedNodes;

function baseDraft(): Record<string, unknown> {
  return {
    headerMenu: { items: [] },
    blogPosts: [{ id: "post1", title: "Kept post" }],
    customPages: [
      { id: "seller-page", slug: "wholesale", title: "Wholesale", navLabel: "Wholesale", template: "info", enabled: true, showInNav: true, showInFooter: false, sortOrder: 50, routeKind: "custom" },
    ],
    websiteStudio: { version: 2, engine: "craft", templateId: "market", nodes: COMMERCE, pageNodes: { "commerce-shop": COMMERCE, "seller-page": COMMERCE } },
  };
}

function build(state: Partial<JobState>, briefPatch?: Parameters<typeof fixtureBrief>[0]) {
  const ctx = fixtureContext();
  const brief = fixtureBrief(briefPatch);
  const plan = normalizePlan(null, pageTargets(ctx, brief));
  return { ctx, brief, plan, result: buildCandidate({ ctx, businessMode: "FARM_STAND", brief, state: { plan, contents: {}, ...state }, baseDraft: baseDraft() }) };
}

test("basic starter builds a valid draft from seller words only", () => {
  const { result } = build({});
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const draft = result.candidate.draft;
  const studio = extractWebsiteStudio(draft);
  assert.ok(studio?.nodes, "home layout written");
  assert.ok(studio?.pageNodes?.["commerce-shop"], "commerce layouts kept");
  assert.equal(draft.headerMenu, undefined, "navigation goes back to automatic");
  assert.deepEqual(draft.blogPosts, [{ id: "post1", title: "Kept post" }], "blog posts untouched");
  const pages = ensureCustomPages(draft);
  assert.equal(pages.find((p) => p.id === "seller-page")?.enabled, false, "unselected page switched off, not deleted");
  assert.ok(studio?.pageNodes?.["seller-page"], "unselected page layout kept");
  assert.equal(pages.find((p) => p.id === "builtin-about")?.enabled, true);
  assert.deepEqual(findPublishBlockers(draft), []);
});

test("policies without AI copy are left out instead of shipping empty pages", () => {
  const { result } = build({}, (b) => {
    b.pages.policies = ["PRIVACY"];
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(!result.candidate.reviewPageIds.includes("builtin-privacy"));
  assert.ok(result.notes.some((n) => n.includes("Privacy")));
});

test("AI policy drafts carry a review marker that blocks publishing until reviewed", () => {
  const policy: PageContent = {
    seoTitle: "Privacy",
    seoDescription: "How we handle your details.",
    sections: [0, 1, 2].map((index) => ({
      index,
      heading: `Part ${index + 1}`,
      body: "We only use your details to fill your order and contact you about it.",
      supportingText: null,
      ctaLabel: null,
      faqItems: null,
      imageAlt: null,
    })),
  };
  const { result } = build({ contents: { "policy:PRIVACY": policy } }, (b) => {
    b.pages.policies = ["PRIVACY"];
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.candidate.reviewPageIds, ["builtin-privacy"]);
  const blockers = findPublishBlockers(result.candidate.draft);
  assert.ok(blockers.some((b) => b.includes("Review the AI-drafted")));
});

test("missing plan fails clearly", () => {
  const ctx = fixtureContext();
  const res = buildCandidate({ ctx, businessMode: "FARM_STAND", brief: fixtureBrief(), state: {}, baseDraft: {} });
  assert.equal(res.ok, false);
});
