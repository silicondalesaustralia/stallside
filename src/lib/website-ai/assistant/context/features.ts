import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { standPaymentBrands, withSquarePaymentsReady } from "@/lib/stand-payment-brands";
import type { NamedEntity } from "./types";

const entitySelect = { id: true, title: true, slug: true } as const;

type FeatureEntities = {
  menus: NamedEntity[];
  preOrders: NamedEntity[];
  subscriptions: NamedEntity[];
  upcomingDrop: boolean;
};

/** Active menus, pre-order pages and subscription offers for the website stand. */
export async function loadFeatureEntities(ownerId: string, standId: string): Promise<FeatureEntities> {
  try {
    const where = { ownerId, standId, isActive: true };
    const [menus, preOrders, subscriptions, drops] = await Promise.all([
      prisma.menu.findMany({ where: { ...where, showOnShop: true }, select: entitySelect, take: 12 }),
      prisma.preOrderPage.findMany({ where, select: entitySelect, take: 12 }),
      prisma.subscriptionOffer.findMany({ where, select: entitySelect, take: 12 }),
      prisma.menu.count({
        where: { ...where, showOnShop: true, kind: { not: MenuKind.ALWAYS_AVAILABLE }, orderByAt: { gt: new Date() } },
      }),
    ]);
    return { menus, preOrders, subscriptions, upcomingDrop: drops > 0 };
  } catch (err) {
    console.error("[website-ai] feature entities", err instanceof Error ? err.message : err);
    return { menus: [], preOrders: [], subscriptions: [], upcomingDrop: false };
  }
}

/** Payment methods customers can actually use now (includes Square readiness). */
export async function loadPaymentBrandIds(ctx: NonNullable<StorefrontContext>): Promise<string[]> {
  try {
    const owner = await withSquarePaymentsReady(ctx.owner);
    return standPaymentBrands(ctx.stand, { ...owner, user: ctx.owner.user });
  } catch (err) {
    console.error("[website-ai] payment brands", err instanceof Error ? err.message : err);
    return standPaymentBrands(ctx.stand, { ...ctx.owner, squarePaymentsReady: false, user: ctx.owner.user });
  }
}
