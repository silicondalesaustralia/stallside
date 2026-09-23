import { formatMoney } from "@/lib/money";
import { membershipHeroPrice } from "@/lib/membership-offer-pricing";

type CardCopy = {
  quantityLabel: string | null;
  shortDescription: string;
};

type IntroCopy = {
  eyebrow: string;
  heading: string;
  intro: string;
  footer: string;
};

/** Fletcherbrook goat-share card copy keyed by offer slug. */
const FLETCHERBROOK_CARDS: Record<string, CardCopy> = {
  "lunas-family-share": {
    quantityLabel: "1 litre each week",
    shortDescription:
      "Sponsor Luna with a litre reserved for you every week.",
  },
  "maiseys-herd-share": {
    quantityLabel: "2 litres each week",
    shortDescription:
      "Sponsor Maisey with two litres reserved for you every week.",
  },
  "rubys-little-share": {
    quantityLabel: "500 mL each week",
    shortDescription:
      "Sponsor Ruby with half a litre reserved for you every week.",
  },
  "the-farmhouse-share": {
    quantityLabel: "3 litres each week",
    shortDescription:
      "Sponsor the herd with three litres reserved for you every week.",
  },
};

/** Approved listing order for Fletcherbrook (not alphabetical). */
const FLETCHERBROOK_ORDER = [
  "lunas-family-share",
  "maiseys-herd-share",
  "rubys-little-share",
  "the-farmhouse-share",
] as const;

export function sortMembershipCategoryOffers<T extends { slug: string; title: string }>(
  standSlug: string,
  offers: T[],
): T[] {
  if (standSlug !== "fletcherbrook") {
    return [...offers].sort((a, b) => a.title.localeCompare(b.title));
  }
  const rank = new Map<string, number>(
    FLETCHERBROOK_ORDER.map((slug, i) => [slug, i]),
  );
  return [...offers].sort((a, b) => {
    const ai = rank.get(a.slug);
    const bi = rank.get(b.slug);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function membershipCategoryIntro(
  standSlug: string,
  standName: string,
): IntroCopy {
  if (standSlug === "fletcherbrook") {
    return {
      eyebrow: standName,
      heading: "A little closer to the herd.",
      intro:
        "Explore our milk memberships. Choose your weekly share and make the farm part of your routine.",
      footer:
        "A connection to the herd, with a share reserved for you. Explore a membership for payment options and full details.",
    };
  }
  return {
    eyebrow: standName,
    heading: "Memberships",
    intro: `Explore memberships from ${standName}. Choose a share that fits your routine.`,
    footer:
      "Explore a membership for payment options and full details.",
  };
}

export function membershipCategoryCardCopy(input: {
  standSlug: string;
  offerSlug: string;
  title: string;
  description: string | null;
}): CardCopy {
  if (input.standSlug === "fletcherbrook") {
    const hit = FLETCHERBROOK_CARDS[input.offerSlug];
    if (hit) return hit;
  }
  const first = input.description
    ?.split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .find((p) => p && !/member price|paid upfront|standard retail/i.test(p));
  return {
    quantityLabel: null,
    shortDescription:
      first || `Learn more about ${input.title}.`,
  };
}

export function membershipCategoryPrice(input: {
  currency: string;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
}): { amount: string; unit: string } | null {
  const hero = membershipHeroPrice(input);
  if (!hero) return null;
  const code = input.currency.trim().toUpperCase() || "AUD";
  if (hero.suffix.includes("week")) {
    return { amount: hero.amount, unit: `${code} / week` };
  }
  if (hero.suffix.includes("month")) {
    return { amount: hero.amount, unit: `${code} / month` };
  }
  return { amount: hero.amount, unit: `${code} upfront` };
}

export function membershipCategoryTermLine(input: {
  currency: string;
  termWeeks: number | null;
  upfrontPriceCents: number | null;
}): string | null {
  const term =
    input.termWeeks != null && input.termWeeks > 0
      ? `${input.termWeeks}-week membership`
      : null;
  const upfront =
    input.upfrontPriceCents != null && input.upfrontPriceCents > 0
      ? `${formatMoney(input.upfrontPriceCents, input.currency)} paid upfront`
      : null;
  if (term && upfront) return `${term} · ${upfront}`;
  return term ?? upfront;
}