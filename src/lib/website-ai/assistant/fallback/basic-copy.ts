import type { BriefData } from "../brief/schema";
import type { AssistantContext } from "../context/types";
import type { ModelSectionType, PageContent, SectionCopy } from "../ai/schemas";
import type { NormalizedPage } from "../plan/normalize";

const HEADINGS: Partial<Record<ModelSectionType, string>> = {
  contactForm: "Get in touch",
  productGrid: "Shop our range",
  categories: "Browse by category",
  nextDrop: "Next drop",
  reviews: "What customers say",
  pickup: "Pickup & delivery",
  signup: "Stay in the loop",
  farmStand: "Visit the stand",
  payments: "Ways to pay",
};

function copy(index: number, heading: string | null, body: string | null): SectionCopy {
  return { index, heading, body, supportingText: null, ctaLabel: null, faqItems: null, imageAlt: null };
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim().slice(0, 160);
}

/**
 * Deterministic copy built only from what the seller entered. Sections without honest content
 * (FAQ, policies, generic text) get null copy and are omitted by the section builders.
 */
export function basicPageContent(ctx: AssistantContext, brief: BriefData, page: NormalizedPage): PageContent {
  const b = brief.business;
  const name = b.name || ctx.businessName;
  const description = b.description || b.offering;
  const sections = page.sections.map((section, index): SectionCopy => {
    switch (section.type) {
      case "hero":
        return { ...copy(index, page.target.kind === "home" ? name : page.title, firstSentence(description) || null), ctaLabel: null };
      case "about":
        return copy(index, `About ${name}`, b.story || description || null);
      case "imageText":
        return copy(index, b.offering ? "What we offer" : null, b.offering || b.differentiators || null);
      case "text":
        if (page.target.kind === "policy" || page.target.kind === "faq") return copy(index, null, null);
        return copy(index, page.title, index === 0 ? description || null : null);
      case "faq":
        return copy(index, null, null);
      default:
        return copy(index, HEADINGS[section.type] ?? null, null);
    }
  });
  return {
    seoTitle: page.target.kind === "home" ? name : `${page.title} | ${name}`,
    seoDescription: firstSentence(description) || `${page.title} at ${name}.`,
    sections,
  };
}
