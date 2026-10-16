import { prisma } from "@/lib/prisma";
import { generateDecorativePlaceholders } from "@/lib/website-ai/decorative-images";
import { legacyContext } from "../compile/design";
import { buildCandidate } from "./candidate";
import type { StepInput, StepOutcome } from "./outcome";
import { addNote, type JobState } from "./state";

export function prepareStep(input: StepInput): StepOutcome {
  const state: JobState = input.job.mode === "basic" ? { ...input.state, aiOff: true } : input.state;
  return { kind: "next", stage: "plan", state };
}

/** Up to two decorative images, stored in per-job slots so retries never generate twice. */
export async function imagesStep(input: StepInput): Promise<StepOutcome> {
  const { brief, state } = input;
  if (!brief.branding.decorativeImages || state.decorative !== undefined) {
    return { kind: "next", stage: "pages", state };
  }
  const existing = await prisma.websiteAsset.findMany({
    where: { jobId: input.job.id, slotKey: { in: ["hero", "story"] } },
    select: { slotKey: true, url: true },
  });
  const hero = existing.find((a) => a.slotKey === "hero")?.url;
  const story = existing.find((a) => a.slotKey === "story")?.url;
  if (hero && story) return { kind: "next", stage: "pages", state: { ...state, decorative: { heroUrl: hero, storyUrl: story } } };

  const assets = await generateDecorativePlaceholders(legacyContext(input.context.assistant, brief));
  if (!assets) {
    return { kind: "next", stage: "pages", state: addNote({ ...state, decorative: null }, "Decorative images were skipped because image generation is unavailable.") };
  }
  await prisma.websiteAsset.createMany({
    data: [
      { slotKey: "hero", url: assets.heroUrl, alt: assets.heroAlt, role: "hero" },
      { slotKey: "story", url: assets.storyUrl, alt: assets.storyAlt, role: "story" },
    ].map((a) => ({ ...a, ownerId: input.job.ownerId, jobId: input.job.id, source: "ai_decorative" })),
    skipDuplicates: true,
  });
  return {
    kind: "next",
    stage: "pages",
    state: { ...state, decorative: { heroUrl: assets.heroUrl, storyUrl: assets.storyUrl } },
    images: 2,
    imageModel: assets.model,
    imageUsage: assets.usage ?? null,
  };
}

export function compileStep(input: StepInput): StepOutcome {
  const { context } = input;
  const built = buildCandidate({
    ctx: context.assistant,
    businessMode: context.storefront.businessMode,
    brief: input.brief,
    state: input.state,
    baseDraft: context.storefront.storefront.draftConfig,
  });
  if (!built.ok) return { kind: "failed", code: "compile", message: built.errors.slice(0, 3).join(" ") };
  let state: JobState = {
    ...input.state,
    reviewPageIds: built.candidate.reviewPageIds,
    keptPolicyPageIds: built.candidate.keptPolicyPageIds,
  };
  for (const note of built.notes) state = addNote(state, note);
  return { kind: "next", stage: "apply", state };
}

/** Rebuilds against the latest draft; asks the seller when the draft changed during the build. */
export async function applyStep(input: StepInput): Promise<StepOutcome> {
  const row = await prisma.storefront.findFirst({
    where: { id: input.job.storefrontId, ownerId: input.job.ownerId },
    select: { draftConfig: true, draftRevision: true },
  });
  if (!row) return { kind: "failed", code: "storefront_missing", message: "Website not found." };
  const built = buildCandidate({
    ctx: input.context.assistant,
    businessMode: input.context.storefront.businessMode,
    brief: input.brief,
    state: input.state,
    baseDraft: row.draftConfig,
  });
  if (!built.ok) return { kind: "failed", code: "compile", message: built.errors.slice(0, 3).join(" ") };
  if (row.draftRevision !== input.job.baseDraftRevision && !input.state.confirmed) {
    return { kind: "confirm", state: input.state, candidate: built.candidate.draft };
  }
  return {
    kind: "apply",
    state: input.state,
    expectedRevision: row.draftRevision,
    candidate: built.candidate.draft,
    restoreDraft: row.draftConfig,
  };
}
