import type { Data } from "@puckeditor/core";
import type { BusinessMode } from "@/lib/business-mode";
import { normaliseSingletons } from "./puck-mutations";

export function buildStarterHome(input: {
  businessMode: BusinessMode;
  headline: string;
  subheadline: string | null;
  about: string | null;
}): Data {
  const hero = {
    type: "Hero" as const,
    props: {
      headline: input.headline,
      supportingText: input.subheadline ?? "",
      layout: "simple" as const,
      ctaLabel: "Shop now",
      showCta: true,
    },
  };

  const featured = {
    type: "FeaturedProducts" as const,
    props: {
      source: "all" as const,
      categoryId: "",
      productIds: [] as string[],
      limit: 8,
      layout: "grid" as const,
      columns: 3 as const,
      showPrice: true,
      showAvailability: true,
    },
  };

  const about = {
    type: "About" as const,
    props: {
      heading: "About us",
      body:
        input.about ??
        "Tell customers who you are, what you make, and why they will love ordering from you.",
      layout: "simple" as const,
    },
  };

  const content: Data["content"] = [hero];

  if (input.businessMode === "FOOD_BUSINESS" || input.businessMode === "BOTH") {
    content.push({
      type: "UpcomingMenus",
      props: { maxItems: 3, showClosingDate: true, cardStyle: "card" },
    });
  }

  content.push(featured, about);

  if (input.businessMode === "FARM_STAND" || input.businessMode === "BOTH") {
    content.push({
      type: "Text",
      props: {
        heading: "Visit our farm stand",
        body: "Scan the QR code at our stand to browse and pay on your phone.",
        alignment: "centre",
      },
    });
  }

  return normaliseSingletons({ content, root: { props: {} } });
}

export function sanitiseEditorHome(
  data: Data,
  fallback: Data,
): Data {
  const normalised = normaliseSingletons(data);
  if (!normalised.content?.length) return fallback;
  return normalised;
}
