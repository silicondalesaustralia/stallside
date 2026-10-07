/**
 * Seed Sponsor a Goat membership offers.
 *
 * Demo (Alexa's Egg Stand):
 *   npx jiti scripts/seed-sponsor-a-goat.ts
 *
 * Specific owner (first active stand):
 *   npx jiti scripts/seed-sponsor-a-goat.ts --owner cmspu5g2m000404l0wac3n2c2
 *
 * Optional stand slug:
 *   npx jiti scripts/seed-sponsor-a-goat.ts --owner <ownerId> --stand <standSlug>
 */
import "dotenv/config";
import {
  HandoverMode,
  PaymentTiming,
  PrismaClient,
  ShopperSubInterval,
  SubscriptionOfferKind,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Stripe from "stripe";

const EMAIL = "jono@silicondales.com";
const STAND_NAME = "Alexa's Egg Stand";

function argValue(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return null;
  return process.argv[idx + 1]?.trim() || null;
}

const OWNER_ID_ARG = argValue("--owner");
const STAND_SLUG_ARG = argValue("--stand");

const UPFRONT_BENEFITS = `Pay the full 26-week membership upfront and receive:
• One complimentary Fletcherbrook goat's milk soap (valued at $12)
• 10% off eligible Fletcherbrook products during the membership
• First access to surplus milk and selected seasonal releases

Discounts apply to other eligible products only — they do not further reduce the membership price.`;

const TERMS = `How it works
• Commit to 26 weekly collections over about six months.
• Choose weekly, monthly, or pay-in-full billing. Collection is always weekly.
• Collect during the nominated window (or arrange someone else to collect).
• Membership ends after 26 weeks and does not renew automatically.

Planned absences
Give at least 48 hours' notice. Up to two weekly collections may be moved to the end of the term, subject to seasonal availability.

Missed collections
Milk prepared for you without the required notice may be forfeited.

Seasonal supply
Animal welfare comes first. If a share cannot be supplied, we will offer an extension, credit, or refund for that quantity.

Sponsorship
Your named goat is a personal link to the herd. Milk may come from several does. Membership does not transfer ownership of a goat.`;

const TIERS = [
  {
    title: "Ruby's Little Share",
    slug: "rubys-little-share",
    description:
      "Sponsor Ruby · 500 mL reserved weekly for 26 weeks. Member price $5/week ($130 if paid upfront). Standard retail would be about $156.",
    weeklyCents: 500,
    monthlyCents: 2167,
    upfrontCents: 13000,
  },
  {
    title: "Luna's Family Share",
    slug: "lunas-family-share",
    description:
      "Sponsor Luna · 1 litre reserved weekly for 26 weeks. Member price $8.50/week ($221 if paid upfront). Standard retail would be about $260.",
    weeklyCents: 850,
    monthlyCents: 3683,
    upfrontCents: 22100,
  },
  {
    title: "Maisey's Herd Share",
    slug: "maiseys-herd-share",
    description:
      "Sponsor Maisey · 2 litres reserved weekly for 26 weeks. Member price $16/week ($416 if paid upfront). Standard retail would be about $520.",
    weeklyCents: 1600,
    monthlyCents: 6933,
    upfrontCents: 41600,
  },
  {
    title: "The Farmhouse Share",
    slug: "the-farmhouse-share",
    description:
      "Sponsor the herd · 3 litres reserved weekly for 26 weeks. Member price $22.50/week ($585 if paid upfront). Standard retail would be about $780.",
    weeklyCents: 2250,
    monthlyCents: 9750,
    upfrontCents: 58500,
  },
] as const;

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "membership"
  );
}

async function uniqueProductSlug(
  prisma: PrismaClient,
  standId: string,
  base: string,
): Promise<string> {
  const root = slugify(base);
  for (let i = 0; i < 1000; i += 1) {
    const candidate = i === 0 ? root : `${root}-${i}`;
    const hit = await prisma.product.findFirst({
      where: { standId, slug: candidate },
      select: { id: true },
    });
    if (!hit) return candidate;
  }
  throw new Error("Could not allocate product slug");
}

async function upsertFulfilmentProduct(
  prisma: PrismaClient,
  input: {
    standId: string;
    ownerId: string;
    existingProductId: string | null;
    title: string;
    priceCents: number;
    currency: string;
    collectionNote: string;
  },
): Promise<string> {
  const name = input.title.slice(0, 120);
  const data = {
    name,
    priceCents: input.priceCents,
    currency: input.currency,
    stockQuantity: 99999,
    lowStockThreshold: 0,
    isHidden: true,
    isActive: true,
    isArchived: false,
    isPreOrder: true,
    showExactStock: false,
    paymentTiming: PaymentTiming.PAY_UPFRONT,
    handoverMode: HandoverMode.COLLECT,
    collectionNote: input.collectionNote,
  };

  if (input.existingProductId) {
    const existing = await prisma.product.findFirst({
      where: { id: input.existingProductId, standId: input.standId },
      select: { id: true },
    });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      return existing.id;
    }
  }

  const slug = await uniqueProductSlug(
    prisma,
    input.standId,
    `membership-${name}`,
  );
  const created = await prisma.product.create({
    data: {
      standId: input.standId,
      ownerId: input.ownerId,
      slug,
      ...data,
    },
  });
  return created.id;
}

async function archivePrice(
  stripe: Stripe,
  acct: { stripeAccount: string },
  priceId: string | null,
) {
  if (!priceId) return;
  try {
    await stripe.prices.update(priceId, { active: false }, acct);
  } catch (error) {
    console.error("Could not archive price", priceId, error);
  }
}

async function syncPrices(params: {
  stripeAccountId: string;
  title: string;
  currency: string;
  existingProductId: string | null;
  weeklyCents: number;
  monthlyCents: number;
  upfrontCents: number;
  existingWeeklyPriceId: string | null;
  existingMonthlyPriceId: string | null;
  existingUpfrontPriceId: string | null;
}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  const stripe = new Stripe(key);
  const acct = { stripeAccount: params.stripeAccountId };

  let productId = params.existingProductId;
  if (!productId) {
    const product = await stripe.products.create(
      { name: params.title, metadata: { purpose: "shopper_subscription" } },
      acct,
    );
    productId = product.id;
  } else {
    await stripe.products.update(productId, { name: params.title }, acct);
  }

  await archivePrice(stripe, acct, params.existingWeeklyPriceId);
  await archivePrice(stripe, acct, params.existingMonthlyPriceId);
  await archivePrice(stripe, acct, params.existingUpfrontPriceId);

  const weekly = await stripe.prices.create(
    {
      product: productId,
      currency: params.currency.toLowerCase(),
      unit_amount: params.weeklyCents,
      recurring: { interval: "week", interval_count: 1 },
      metadata: { purpose: "shopper_subscription" },
    },
    acct,
  );
  const monthly = await stripe.prices.create(
    {
      product: productId,
      currency: params.currency.toLowerCase(),
      unit_amount: params.monthlyCents,
      recurring: { interval: "month", interval_count: 1 },
      metadata: { purpose: "shopper_subscription" },
    },
    acct,
  );
  const upfront = await stripe.prices.create(
    {
      product: productId,
      currency: params.currency.toLowerCase(),
      unit_amount: params.upfrontCents,
      metadata: { purpose: "shopper_subscription" },
    },
    acct,
  );

  return {
    productId,
    weeklyPriceId: weekly.id,
    monthlyPriceId: monthly.id,
    upfrontPriceId: upfront.id,
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    let ownerId: string;
    let stripeAccountId: string | null;
    let stripeChargesEnabled: boolean;
    let stands: {
      id: string;
      name: string;
      slug: string;
      currency: string;
      showSubscriptionsOnStand: boolean;
    }[];

    if (OWNER_ID_ARG) {
      const owner = await prisma.owner.findUnique({
        where: { id: OWNER_ID_ARG },
        include: {
          stands: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              currency: true,
              showSubscriptionsOnStand: true,
            },
          },
        },
      });
      if (!owner) {
        console.error(`No owner for id ${OWNER_ID_ARG}`);
        process.exit(1);
      }
      ownerId = owner.id;
      stripeAccountId = owner.stripeAccountId;
      stripeChargesEnabled = owner.stripeChargesEnabled;
      stands = owner.stands;
    } else {
      const user = await prisma.user.findUnique({
        where: { email: EMAIL },
        include: {
          owner: {
            include: {
              stands: {
                where: { isActive: true },
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  currency: true,
                  showSubscriptionsOnStand: true,
                },
              },
            },
          },
        },
      });
      if (!user?.owner) {
        console.error(`No owner for ${EMAIL}`);
        process.exit(1);
      }
      ownerId = user.owner.id;
      stripeAccountId = user.owner.stripeAccountId;
      stripeChargesEnabled = user.owner.stripeChargesEnabled;
      stands = user.owner.stands;
    }

    const stand = STAND_SLUG_ARG
      ? stands.find((s) => s.slug === STAND_SLUG_ARG)
      : OWNER_ID_ARG
        ? stands[0]
        : (stands.find(
            (s) => s.name.toLowerCase() === STAND_NAME.toLowerCase(),
          ) ??
          stands.find((s) => s.name.toLowerCase().includes("alexa")) ??
          stands[0]);

    if (!stand) {
      console.error(
        STAND_SLUG_ARG
          ? `No active stand with slug ${STAND_SLUG_ARG}`
          : `No stand found for owner ${ownerId}`,
      );
      process.exit(1);
    }

    console.log(
      `Seeding Sponsor a Goat on ${stand.name} (${stand.slug}) owner=${ownerId}`,
    );

    if (!stand.showSubscriptionsOnStand) {
      await prisma.stand.update({
        where: { id: stand.id },
        data: { showSubscriptionsOnStand: true },
      });
      console.log("Enabled showSubscriptionsOnStand");
    }

    const collectionNote =
      "Collect from Fletcherbrook Small Farm during the nominated weekly window.";
    const results: {
      title: string;
      path: string;
      stripeOk: boolean;
    }[] = [];

    for (const tier of TIERS) {
      const existing = await prisma.subscriptionOffer.findFirst({
        where: { standId: stand.id, slug: tier.slug },
      });

      const fulfillmentProductId = await upsertFulfilmentProduct(prisma, {
        standId: stand.id,
        ownerId,
        existingProductId: existing?.fulfillmentProductId ?? null,
        title: tier.title,
        priceCents: tier.weeklyCents,
        currency: stand.currency,
        collectionNote,
      });

      const data = {
        kind: SubscriptionOfferKind.MEMBERSHIP,
        title: tier.title,
        description: tier.description,
        imageUrl: null as string | null,
        isActive: true,
        interval: ShopperSubInterval.WEEKLY,
        handoverMode: HandoverMode.COLLECT,
        collectionWeekday: 6,
        collectionNote,
        priceCents: tier.weeklyCents,
        currency: stand.currency,
        termWeeks: 26,
        weeklyPriceCents: tier.weeklyCents,
        monthlyPriceCents: tier.monthlyCents,
        upfrontPriceCents: tier.upfrontCents,
        upfrontBenefitsText: UPFRONT_BENEFITS,
        termsText: TERMS,
        fulfillmentProductId,
      };

      let offerId: string;
      if (existing) {
        await prisma.subscriptionOfferProduct.deleteMany({
          where: { subscriptionOfferId: existing.id },
        });
        await prisma.subscriptionOffer.update({
          where: { id: existing.id },
          data: {
            ...data,
            items: {
              create: [
                {
                  productId: fulfillmentProductId,
                  quantity: 1,
                  sortOrder: 0,
                },
              ],
            },
          },
        });
        offerId = existing.id;
      } else {
        const created = await prisma.subscriptionOffer.create({
          data: {
            standId: stand.id,
            ownerId,
            slug: tier.slug,
            ...data,
            items: {
              create: [
                {
                  productId: fulfillmentProductId,
                  quantity: 1,
                  sortOrder: 0,
                },
              ],
            },
          },
        });
        offerId = created.id;
      }

      let stripeOk = false;
      if (stripeAccountId && stripeChargesEnabled) {
        try {
          const offer = await prisma.subscriptionOffer.findUniqueOrThrow({
            where: { id: offerId },
          });
          const synced = await syncPrices({
            stripeAccountId,
            title: tier.title,
            currency: stand.currency,
            existingProductId: offer.stripeProductId,
            weeklyCents: tier.weeklyCents,
            monthlyCents: tier.monthlyCents,
            upfrontCents: tier.upfrontCents,
            existingWeeklyPriceId: offer.stripeWeeklyPriceId,
            existingMonthlyPriceId: offer.stripeMonthlyPriceId,
            existingUpfrontPriceId: offer.stripeUpfrontPriceId,
          });
          await prisma.subscriptionOffer.update({
            where: { id: offerId },
            data: {
              stripeProductId: synced.productId,
              stripeWeeklyPriceId: synced.weeklyPriceId,
              stripeMonthlyPriceId: synced.monthlyPriceId,
              stripeUpfrontPriceId: synced.upfrontPriceId,
              stripePriceId: synced.weeklyPriceId,
            },
          });
          stripeOk = true;
        } catch (error) {
          console.error(`Stripe sync failed for ${tier.title}`, error);
        }
      }

      results.push({
        title: tier.title,
        path: `/s/${stand.slug}/sub/${tier.slug}`,
        stripeOk,
      });
    }

    console.log(
      JSON.stringify(
        { ownerId, stand: stand.name, slug: stand.slug, results },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
