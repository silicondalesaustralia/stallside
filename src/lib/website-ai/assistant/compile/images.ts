import type { AssistantContext } from "../context/types";
import type { BriefData } from "../brief/schema";
import type { NormalizedPage } from "../plan/normalize";

export type DecorativeSet = { heroUrl: string; storyUrl: string } | null;

export type ImagePool = {
  /** Seller-provided hero; written to identity so every surface uses it. */
  sellerHero: string | null;
  /** AI decorative hero; only used inside hero section props. */
  decorativeHero: string | null;
  story: string[];
};

/** The seller's own hero photo (never an AI decorative one). */
export function sellerHeroUrl(ctx: AssistantContext, brief: BriefData): string | null {
  const heroPhoto = brief.branding.photos.find((p) => p.purpose === "hero")?.url ?? null;
  return brief.branding.heroImageUrl ?? heroPhoto ?? ctx.existing.heroImageUrl;
}

export function buildImagePool(ctx: AssistantContext, brief: BriefData, decorative: DecorativeSet): ImagePool {
  const photos = brief.branding.photos;
  const sellerHero = sellerHeroUrl(ctx, brief);
  const story = photos
    .filter((p) => p.purpose === "team" || p.purpose === "general" || p.purpose === "product")
    .map((p) => p.url)
    .filter((url) => url !== sellerHero);
  if (decorative) story.push(decorative.storyUrl);
  return {
    sellerHero,
    decorativeHero: sellerHero ? null : decorative?.heroUrl ?? null,
    story,
  };
}

/** Image URL per section index for one page; images are spread across pages before repeating. */
export function assignPageImages(page: NormalizedPage, pool: ImagePool, cursor: { next: number }): Record<number, string> {
  const out: Record<number, string> = {};
  page.sections.forEach((section, index) => {
    if (section.type === "hero" && pool.decorativeHero) out[index] = pool.decorativeHero;
    if (section.type === "imageText" && pool.story.length > 0) {
      out[index] = pool.story[cursor.next % pool.story.length];
      cursor.next += 1;
    }
  });
  return out;
}
