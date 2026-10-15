import type { SectionInstance } from "@/lib/website/schema/definition";
import { sectionDefinition } from "@/lib/website/sections/registry";
import type { VendlSectionType } from "@/lib/website/sections/types";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import { defaultHeroPreset, isValidHeroPreset } from "@/lib/studio/preset-registry";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { ModelSectionType, SectionCopy } from "../ai/schemas";

export type BuildInput = {
  id: string;
  type: ModelSectionType;
  copy: SectionCopy | null;
  templateId: StudioTemplateId;
  preset?: string;
  imageUrl?: string;
  /** Button target token (page:shop, nav:<slug>…) for linkable sections. */
  buttonLink?: string;
  productIds?: string[];
  meta?: Record<string, unknown>;
};

const t = (v: string | null | undefined, max: number) => (v ?? "").trim().slice(0, max);

function variant(type: VendlSectionType, preferred: string | undefined, templateId: StudioTemplateId): string {
  if (type === "hero") {
    return preferred && isValidHeroPreset(templateId, preferred) ? preferred : defaultHeroPreset(templateId);
  }
  const def = sectionDefinition(type);
  return preferred && def.variants.includes(preferred) ? preferred : def.defaultVariant;
}

function instance(
  input: BuildInput,
  type: VendlSectionType,
  content: Record<string, unknown>,
  settings: Record<string, unknown> = {},
  binding?: Record<string, unknown>,
): SectionInstance {
  const clean = Object.fromEntries(Object.entries(content).filter(([, v]) => v !== "" && v !== undefined));
  return {
    id: input.id,
    type,
    schemaVersion: 1,
    variant: variant(type, input.preset, input.templateId),
    visibility: "public",
    content: clean,
    settings: input.buttonLink ? { ...settings, buttonLink: input.buttonLink } : settings,
    ...(binding ? { binding } : {}),
    editorMeta: { source: "website-ai-assistant", aiType: input.type, ...(input.meta ?? {}) },
  };
}

function faqItems(copy: SectionCopy | null, id: string) {
  return (copy?.faqItems ?? [])
    .filter((i) => i.question.trim() && i.answer.trim())
    .slice(0, 12)
    .map((i, n) => ({ id: `${id}-q${n + 1}`, question: t(i.question, 300), answer: t(i.answer, L.bodyChars) }));
}

/** Registry-valid section for one planned block, or null when there's nothing honest to show. */
export function buildSection(input: BuildInput): SectionInstance | null {
  const c = input.copy;
  const heading = t(c?.heading, L.headingChars);
  const body = t(c?.body, L.bodyChars);
  switch (input.type) {
    case "hero":
      return instance(input, "hero", {
        headline: heading,
        supportingText: t(c?.supportingText ?? c?.body, L.shortTextChars),
        ctaLabel: t(c?.ctaLabel, L.labelChars),
        decorativeImageUrl: input.imageUrl,
      }, { showCta: Boolean(t(c?.ctaLabel, L.labelChars)) });
    case "about":
      return body ? instance(input, "about", { heading, body }) : null;
    case "text":
      return body ? instance(input, "text", { heading, body }, { alignment: "left" }) : null;
    case "imageText":
      if (!body) return null;
      if (!input.imageUrl) return instance({ ...input, type: "text" }, "text", { heading, body }, { alignment: "left" });
      return instance(input, "imageText", { heading, body, imageUrl: input.imageUrl, ctaLabel: t(c?.ctaLabel, L.labelChars) });
    case "faq": {
      const items = faqItems(c, input.id);
      return items.length ? instance(input, "faq", { heading, intro: t(c?.supportingText, L.shortTextChars), items }) : null;
    }
    case "contactForm":
      return instance(input, "contactForm", { heading: heading || "Get in touch", body, buttonLabel: t(c?.ctaLabel, L.labelChars) });
    case "signup":
      return instance(input, "signup", {
        heading: heading || "Stay in the loop",
        body: t(c?.body, L.shortTextChars),
        buttonLabel: t(c?.ctaLabel, L.labelChars),
      });
    case "productGrid": {
      const manual = (input.productIds ?? []).slice(0, L.productIdsPerSection);
      const binding = manual.length ? { source: "manual", productIds: manual } : { source: "all" };
      return instance(input, "productGrid", { heading: heading || "Our products" }, { showPrice: true, showAvailability: true }, binding);
    }
    case "categories":
      return instance(input, "categories", { heading: heading || "Browse by category" }, {}, { source: "all" });
    case "nextDrop":
      return instance(input, "nextDrop", { heading: heading || "Order now" }, { showClosingDate: true, showPickupDate: true });
    case "reviews":
      return instance(input, "reviews", { heading: heading || "What customers say" }, { maxItems: 4 });
    case "pickup":
      return instance(input, "pickup", { heading: heading || "Pickup & delivery" });
    case "farmStand":
      return instance(input, "farmStand", { heading: heading || "Visit us" }, { showHours: true, showLocation: true, showDirections: true });
    case "payments":
      return instance(input, "payments", { heading: heading || "Ways to pay" }, { showLabels: true });
  }
}
