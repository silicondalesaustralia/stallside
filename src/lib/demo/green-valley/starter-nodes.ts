import type { SerializedNodes } from "@craftjs/core";
import type { StudioTemplateId } from "@/lib/studio/types";
import {
  defaultHeroPreset,
  defaultProductPreset,
} from "@/lib/studio/preset-registry";

type SectionDef = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

function node(
  id: string,
  type: string,
  props: Record<string, unknown>,
  parent: string,
  isCanvas = false,
  childIds: string[] = [],
): SerializedNodes[string] {
  return {
    type: { resolvedName: type },
    isCanvas,
    props,
    displayName: type,
    custom: {},
    hidden: false,
    nodes: childIds,
    linkedNodes: {},
    parent,
  };
}

function treeFromSections(sections: SectionDef[]): SerializedNodes {
  const pageId = "page";
  const nodes: SerializedNodes = {
    ROOT: node("ROOT", "div", {}, "", true, [pageId]),
    [pageId]: node(
      pageId,
      "CraftPageRoot",
      {},
      "ROOT",
      true,
      sections.map((s) => s.id),
    ),
  };
  // Fix ROOT parent typing — Craft expects parent null on ROOT
  nodes.ROOT = {
    ...nodes.ROOT,
    parent: null,
  };

  for (const section of sections) {
    nodes[section.id] = node(
      section.id,
      section.type,
      section.props,
      pageId,
      false,
      [],
    );
  }
  return nodes;
}

const STORY_BODY =
  "Green Valley began with a vegetable patch, a few hens and more sourdough than our family could eat. What started as an honesty-box farm stand has grown into a weekly rhythm of baking, harvesting and sharing good food with our local community. We still keep things deliberately small.";

export function buildGreenValleyHomeNodes(
  templateId: StudioTemplateId,
): SerializedNodes {
  const heroPreset = defaultHeroPreset(templateId);
  const productPreset = defaultProductPreset(templateId);

  const hero: SectionDef = {
    id: "hero",
    type: "CraftHeroSection",
    props: {
      headline: "Grown here. Baked here. Shared locally.",
      supportingText:
        "Fresh sourdough, small-batch bakes, eggs and seasonal produce from our little patch in the Adelaide Hills.",
      layout: heroPreset,
      ctaLabel: templateId === "market" ? "Shop now" : "Shop this week",
      showCta: true,
    },
  };

  const nextDrop: SectionDef = {
    id: "nextdrop",
    type: "CraftNextDropSection",
    props: {
      maxItems: templateId === "market" ? 3 : 1,
      showClosingDate: true,
      showPickupDate: true,
      preset:
        templateId === "farmhouse"
          ? "next-collection"
          : templateId === "market"
            ? "current-menu"
            : "featured",
      heading:
        templateId === "farmhouse"
          ? "Next collection"
          : templateId === "market"
            ? "This week's menu"
            : "This week's bake",
    },
  };

  const products: SectionDef = {
    id: "products",
    type: "CraftProductGridSection",
    props: {
      source: "all",
      categoryId: "",
      productIds: [],
      limit: templateId === "market" ? 12 : 6,
      layout: "grid",
      columns: templateId === "market" ? 4 : 3,
      preset: productPreset,
      heading:
        templateId === "farmhouse"
          ? "Fresh from the farm"
          : templateId === "market"
            ? "Shop Green Valley"
            : "Fresh from Green Valley",
      showPrice: true,
      showAvailability: true,
    },
  };

  const story: SectionDef = {
    id: "story",
    type: "CraftImageTextSection",
    props: {
      imageUrl: "",
      heading:
        templateId === "farmhouse" ? "Farm grown. Hand made." : "Farm grown. Hand made.",
      body: STORY_BODY,
      layout: "image-left",
      ctaLabel: "Our story",
    },
  };

  const categories: SectionDef = {
    id: "categories",
    type: "CraftCategoriesSection",
    props: {
      source: "all",
      categoryIds: [],
      preset:
        templateId === "farmhouse"
          ? "produce-tiles"
          : templateId === "market"
            ? "shop-cards"
            : "tiles",
      heading: "Shop Green Valley",
    },
  };

  const reviews: SectionDef = {
    id: "reviews",
    type: "CraftReviewsSection",
    props: {
      preset: "cards",
      heading: "What locals say",
      maxItems: 5,
    },
  };

  const pickup: SectionDef = {
    id: "pickup",
    type: "CraftPickupSection",
    props: {
      preset: templateId === "farmhouse" ? "visit-stand" : "cards",
      heading:
        templateId === "farmhouse" ? "Visit Green Valley" : "Getting your order",
    },
  };

  const signup: SectionDef = {
    id: "signup",
    type: "CraftSignupSection",
    props: {
      heading: "Don't miss the next bake",
      body: "Get the weekly menu, seasonal farm updates and first notice when something special is coming out of the oven.",
      buttonLabel: "Join the list",
    },
  };

  const farmStand: SectionDef = {
    id: "farmstand",
    type: "CraftFarmStandSection",
    props: {
      heading: "The farm stand",
      showHours: true,
      showLocation: true,
      showDirections: false,
    },
  };

  let sections: SectionDef[];
  if (templateId === "artisan") {
    sections = [hero, nextDrop, products, story, categories, reviews, pickup, signup];
  } else if (templateId === "farmhouse") {
    sections = [
      hero,
      farmStand,
      products,
      pickup,
      categories,
      story,
      signup,
      reviews,
    ];
  } else {
    sections = [hero, categories, products, nextDrop, reviews, pickup, signup];
  }

  return treeFromSections(sections);
}

export function buildSimpleTextPageNodes(
  title: string,
  sections: { heading: string; body: string }[],
): SerializedNodes {
  const defs: SectionDef[] = [
    {
      id: "hero",
      type: "CraftHeroSection",
      props: {
        headline: title,
        supportingText: "",
        layout: "minimal",
        ctaLabel: "",
        showCta: false,
      },
    },
    ...sections.map((s, i) => ({
      id: `t${i}`,
      type: "CraftTextSection",
      props: { heading: s.heading, body: s.body, alignment: "left" },
    })),
  ];
  return treeFromSections(defs);
}
