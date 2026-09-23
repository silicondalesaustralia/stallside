import { formatOrderByLabel } from "@/lib/pre-order";
import {
  formatPreorderCollectionDate,
  preorderHandoverHeading,
} from "@/lib/preorder-category-copy";

const FLETCHERBROOK_INTROS: Record<string, string> = {
  "unscented-goat-s-milk-soap-preorder":
    "A rich, creamy lather without added fragrance. Handmade in small batches in Donnybrook, WA.",
  "eucalyptus-lavender-goat-s-milk-soap-preorder":
    "Goat’s milk soap with Dead Sea mud clay and eucalyptus and lavender essential oils, handcrafted in small batches in Donnybrook.",
  "fletcherbrook-sweet-orange-goats-milk-soap":
    "Goat’s milk soap with real orange peel and sweet orange essential oil, handcrafted in small batches in Donnybrook.",
};

export type PreorderDetailFact = {
  label: string;
  value: string;
};

export function preorderDetailIntro(input: {
  standSlug: string;
  pageSlug: string;
  description: string | null;
  productDescription: string | null;
}): string | null {
  if (input.standSlug === "fletcherbrook") {
    const hit = FLETCHERBROOK_INTROS[input.pageSlug];
    if (hit) return hit;
  }
  const raw = input.description?.trim() || input.productDescription?.trim();
  if (!raw) return null;
  const first = raw.split(/(?<=[.!?])\s+/).find((p) => p.trim());
  return first?.trim() || null;
}

export function preorderDetailFacts(input: {
  collectionAt: Date;
  orderByAt: Date;
  timeZone: string;
  handoverMode: string;
  ordersOpen: boolean;
}): PreorderDetailFact[] {
  const handover = preorderHandoverHeading(input.handoverMode);
  const facts: PreorderDetailFact[] = [
    {
      label: handover,
      value: formatPreorderCollectionDate(input.collectionAt, input.timeZone),
    },
  ];
  if (input.ordersOpen) {
    facts.push({
      label: "Orders close",
      value: formatOrderByLabel(input.orderByAt, input.timeZone),
    });
  } else {
    facts.push({
      label: "Status",
      value: "Orders closed",
    });
  }
  return facts;
}

export function preorderOrderCardHeading(input: {
  standSlug: string;
  pageSlug: string;
  productCount: number;
}): string {
  if (input.productCount > 1) return "Your pre-order";
  if (
    input.standSlug === "fletcherbrook" &&
    /soap/i.test(input.pageSlug)
  ) {
    return "Reserve your soap";
  }
  return "Your pre-order";
}

export function preorderAboutHeading(input: {
  standSlug: string;
  pageSlug: string;
  productCount: number;
}): string {
  if (input.productCount > 1) return "About this pre-order";
  if (
    input.standSlug === "fletcherbrook" &&
    /soap/i.test(input.pageSlug)
  ) {
    return "About this soap";
  }
  return "About this product";
}
