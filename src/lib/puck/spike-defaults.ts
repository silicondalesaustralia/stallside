import type { Data } from "@puckeditor/core";
import type { BusinessMode } from "@/lib/business-mode";
import { enabledSections } from "@/lib/storefront/config";
import { buildStarterHome } from "@/lib/puck/starter-home";
import type { StorefrontConfig } from "@/lib/storefront/types";

const SECTION_TO_PUCK: Partial<
  Record<
    string,
    (branding: { headline: string; subheadline: string | null; about: string | null }) => Data["content"][number] | null
  >
> = {
  hero: (b) => ({
    type: "Hero",
    props: {
      headline: b.headline,
      supportingText: b.subheadline ?? "",
      layout: "simple",
      ctaLabel: "Shop now",
      showCta: true,
    },
  }),
  featured_products: () => ({
    type: "FeaturedProducts",
    props: {
      source: "all",
      categoryId: "",
      productIds: [],
      limit: 4,
      layout: "grid",
      columns: 2,
      showPrice: true,
      showAvailability: true,
    },
  }),
  about: (b) =>
    b.about
      ? {
          type: "About",
          props: { heading: "About us", body: b.about, layout: "simple" },
        }
      : null,
  pickup_delivery: () => null,
};

export function buildDefaultSpikeHome(input: {
  config: StorefrontConfig;
  headline: string;
  subheadline: string | null;
  about: string | null;
  businessMode: BusinessMode;
}): Data {
  const starter = buildStarterHome({
    businessMode: input.businessMode,
    headline: input.headline,
    subheadline: input.subheadline,
    about: input.about,
  });

  const branding = {
    headline: input.headline,
    subheadline: input.subheadline,
    about: input.about,
  };
  const content: Data["content"] = [...(starter.content ?? [])];

  for (const section of enabledSections(input.config)) {
    const mapper = SECTION_TO_PUCK[section.id];
    if (!mapper) continue;
    const block = mapper(branding);
    if (!block) continue;
    if (content.some((b) => b.type === block.type)) continue;
    content.push(block);
  }

  return { content, root: { props: {} } };
}

export function emptySpikeHome(): Data {
  return {
    content: [
      {
        type: "Hero",
        props: {
          headline: "Welcome",
          supportingText: "",
          layout: "simple",
          ctaLabel: "Shop now",
          showCta: true,
        },
      },
      {
        type: "Text",
        props: {
          heading: "Tell your story",
          body: "Add sections to build your website.",
          alignment: "centre",
        },
      },
    ],
    root: { props: {} },
  };
}
