import type { CalculatorInput, MarketSeed, SellMarket } from "./types";
import {
  calculatorIntro,
  heroBody,
  heroHeading,
  seoDescription,
  seoTitle,
  storefrontHeading,
} from "./build-market-copy";
import { SHARED_FAQS, nicheFaqs } from "./build-market-faqs";
import {
  operations,
  resourceLinks,
  sellingModes,
  storefrontBody,
  marketingCopy,
} from "./build-market-sections";
import {
  EXEMPLAR_BATCH_VALUES,
  EXEMPLAR_STORE_LABEL,
} from "./exemplar-defaults";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildInputs(seed: MarketSeed): CalculatorInput[] {
  const defaults = [18, 12, 8, 6, 15, 5, 4, 3];
  const mapped = EXEMPLAR_BATCH_VALUES[seed.slug];
  const values = mapped
    ? seed.inputLabels.map((label) => mapped[slugify(label)] ?? 5)
    : seed.inputLabels.map((_, i) => defaults[i] ?? 4);

  const batchInputs: CalculatorInput[] = seed.inputLabels.map((label, i) => ({
    id: slugify(label),
    label,
    unit: "USD",
    value: values[i] ?? 5,
    scope: "batch",
  }));

  return [
    ...batchInputs,
    {
      id: "packaging-per-unit",
      label: "Packaging per unit",
      unit: "USD",
      value: seed.packagingPerUnit,
      scope: "unit",
    },
  ];
}

export function buildMarket(seed: MarketSeed): SellMarket {
  const product = seed.exampleProduct;
  const labelLower = seed.label.toLowerCase();
  const scopeExtra = seed.scope.includes(";")
    ? seed.scope.split(";")[1]!.trim()
    : "";
  const marketing = marketingCopy(seed);

  return {
    slug: seed.slug,
    label: seed.label,
    aliases: seed.aliases,
    categoryId: seed.categoryId,
    variant: seed.variant,
    status: "published",
    scope: seed.scope,
    seo: {
      title: seoTitle(seed),
      description: seoDescription(seed),
      primaryIntent: `sell ${labelLower} online`,
      exclusions: [
        "consumer buy intent",
        "unrelated DIY tutorials",
        scopeExtra,
      ].filter(Boolean),
    },
    hero: {
      heading: heroHeading(seed),
      body: heroBody(seed),
      imageId: `sell-${seed.slug}-hero`,
      imageAlt: `${seed.label} maker storefront example`,
    },
    example: {
      productName: product,
      storeLabel: EXEMPLAR_STORE_LABEL[seed.slug] ?? "Example store",
      isFictional: true,
    },
    calculator: {
      saleUnit: seed.saleUnit,
      outputLabel: `Cost per ${seed.saleUnit}`,
      currencyPresetId: seed.currencyPresetId,
      inputs: buildInputs(seed),
      saleableYield: seed.saleableYield,
      unitsPerPack: seed.slug === "cookies" ? 6 : 1,
      assumptions: [
        "Illustrative demo only — not a formulation or typical-profit claim.",
        calculatorIntro(seed),
        "Packaging is added per saleable unit after batch cost.",
      ],
    },
    storefront: {
      heading: storefrontHeading(seed),
      body: storefrontBody(seed),
      previewId: `sell-${seed.slug}-store`,
    },
    operations: operations(seed, product),
    sellingModes: sellingModes(seed),
    marketing,
    faqs: [...nicheFaqs(seed), ...SHARED_FAQS],
    relatedSlugs: seed.relatedSlugs,
    resourceLinks: resourceLinks(),
    evidence: [],
    review: {
      contentReviewer: "scaffold",
      productReviewer: "scaffold",
      reviewedAt: "2026-11-19",
      version: 1,
    },
  };
}
