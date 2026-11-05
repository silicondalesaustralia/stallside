import { prisma } from "@/lib/prisma";
import { ACTIVE_SQUARE } from "@/lib/lifecycle-emails/cron-helpers";
import { loadSocialAdoption } from "./social-adoption";
import type { Adoption } from "./types";

/** Which tools the owner already uses, so introductions to them can be skipped. */
export async function loadAdoption(ownerId: string, includePro: boolean): Promise<Adoption> {
  const [owner, square, preOrders, offers] = await Promise.all([
    prisma.owner.findUnique({
      where: { id: ownerId },
      select: { stripeChargesEnabled: true, stands: { select: { id: true } } },
    }),
    prisma.externalCommerceConnection.count({ where: { ownerId, ...ACTIVE_SQUARE } }),
    prisma.preOrderPage.count({ where: { ownerId } }),
    prisma.subscriptionOffer.count({ where: { ownerId } }),
  ]);
  const base: Adoption = {
    paymentsConnected: Boolean(owner?.stripeChargesEnabled) || square > 0,
    preOrdersOrSubscriptions: preOrders + offers > 0,
    costingUsed: false,
    pricingUsed: false,
    websitePublished: false,
    socialConnected: false,
    videoUsed: false,
  };
  if (!includePro) return base;

  const [recipes, pricedProducts, storefront, social] = await Promise.all([
    prisma.recipe.count({ where: { ownerId } }),
    prisma.productRecipe.count({ where: { recipe: { ownerId } } }),
    prisma.storefront.findUnique({ where: { ownerId }, select: { isPublished: true } }),
    loadSocialAdoption(owner?.stands.map((s) => s.id) ?? []),
  ]);
  return {
    ...base,
    costingUsed: recipes > 0,
    pricingUsed: pricedProducts > 0,
    websitePublished: Boolean(storefront?.isPublished),
    ...social,
  };
}