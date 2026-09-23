import { formatDateInTz } from "@/lib/stand-timezone";

type CardCopy = {
  shortDescription: string;
};

const FLETCHERBROOK_SUMMARIES: Record<string, string> = {
  "eucalyptus-lavender-goat-s-milk-soap-preorder":
    "Goat’s milk soap with Dead Sea mud clay and eucalyptus and lavender essential oils, handcrafted in small batches in Donnybrook.",
  "unscented-goat-s-milk-soap-preorder":
    "Goat’s milk soap without added fragrance, with a rich, creamy lather. Handmade in small batches in Donnybrook.",
  "fletcherbrook-sweet-orange-goats-milk-soap":
    "Goat’s milk soap with real orange peel and sweet orange essential oil, handcrafted in small batches in Donnybrook.",
};

export function preorderCategoryIntro(standName: string): {
  eyebrow: string;
  heading: string;
  intro: string;
} {
  return {
    eyebrow: standName,
    heading: "Pre-orders",
    intro:
      "Choose what you’d like to order ahead, then view collection details and availability.",
  };
}

export function preorderCategoryCardCopy(input: {
  standSlug: string;
  pageSlug: string;
  title: string;
  description: string | null;
}): CardCopy {
  if (input.standSlug === "fletcherbrook") {
    const hit = FLETCHERBROOK_SUMMARIES[input.pageSlug];
    if (hit) return { shortDescription: hit };
  }
  const excerpt = shortExcerpt(input.description);
  return {
    shortDescription: excerpt || `View details for ${input.title}.`,
  };
}

function shortExcerpt(description: string | null): string | null {
  const text = description?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const words = text.split(" ");
  if (words.length <= 30) return text;
  return `${words.slice(0, 28).join(" ")}…`;
}

/** Full weekday date in the stand timezone (no UTC day-shift). */
export function formatPreorderCollectionDate(
  d: Date,
  timeZone: string,
): string {
  return formatDateInTz(d, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function preorderHandoverHeading(
  handoverMode: string,
): "Collection" | "Delivery" {
  return handoverMode === "DELIVER" ? "Delivery" : "Collection";
}
