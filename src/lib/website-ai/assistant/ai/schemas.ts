import { z } from "zod";

/** Section types the model may place. Commerce detail/cart sections are never model-placed. */
export const MODEL_SECTION_TYPES = [
  "hero",
  "about",
  "imageText",
  "text",
  "faq",
  "contactForm",
  "productGrid",
  "categories",
  "nextDrop",
  "reviews",
  "pickup",
  "signup",
  "farmStand",
  "payments",
] as const;
export type ModelSectionType = (typeof MODEL_SECTION_TYPES)[number];

/** Strict-mode friendly: every field required, nullable instead of optional, no free-form records. */
export const sitePlanSchema = z.object({
  siteSummary: z.string(),
  pages: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      navLabel: z.string(),
      purpose: z.string(),
      sections: z.array(z.object({ type: z.enum(MODEL_SECTION_TYPES), purpose: z.string() })),
    }),
  ),
  unsupported: z.array(z.object({ request: z.string(), reason: z.string() })),
  missingFacts: z.array(z.string()),
});
export type SitePlan = z.infer<typeof sitePlanSchema>;
export type PlannedPage = SitePlan["pages"][number];

export const pageContentSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  sections: z.array(
    z.object({
      index: z.number().int(),
      heading: z.string().nullable(),
      body: z.string().nullable(),
      supportingText: z.string().nullable(),
      ctaLabel: z.string().nullable(),
      faqItems: z.array(z.object({ question: z.string(), answer: z.string() })).nullable(),
      imageAlt: z.string().nullable(),
    }),
  ),
});
export type PageContent = z.infer<typeof pageContentSchema>;
export type SectionCopy = PageContent["sections"][number];

export const followUpSchema = z.object({
  questions: z.array(z.object({ id: z.string(), question: z.string() })),
});
export type FollowUpResult = z.infer<typeof followUpSchema>;

export const IMPORT_FACT_FIELDS = [
  "description",
  "offering",
  "story",
  "serviceArea",
  "audience",
  "differentiators",
] as const;

export const importFactsSchema = z.object({
  facts: z.array(z.object({ field: z.enum(IMPORT_FACT_FIELDS), value: z.string() })),
});
export type ImportFactsResult = z.infer<typeof importFactsSchema>;
