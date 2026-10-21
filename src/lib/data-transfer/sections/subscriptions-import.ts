import { prisma } from "@/lib/prisma";
import { HandoverMode, ShopperSubInterval, SubscriptionOfferKind } from "@/generated/prisma/client";
import { upsertMembershipFulfilmentProduct } from "@/lib/membership-fulfilment-product";
import type { DataContext, Importer, ImportResult, PlannedRow } from "../context";
import { copyImages } from "../image-copy";
import { planSubscriptions, type SubscriptionRow } from "./subscriptions-import-plan";
import { syncImportedOfferStripe } from "./subscriptions-stripe";

async function writeOffer(row: PlannedRow<SubscriptionRow>, ctx: DataContext, warn: (m: string) => void) {
  const d = row.data;
  const current = row.existingId
    ? await prisma.subscriptionOffer.findUniqueOrThrow({ where: { id: row.existingId } })
    : null;
  const [imageUrl] =
    d.imageUrl && d.imageUrl !== current?.imageUrl
      ? await copyImages([d.imageUrl], ctx.stand.id, "subscriptions", (m) => warn(`Row ${row.line}: ${m}`))
      : [];
  const title = d.title ?? current?.title ?? d.slug;
  const handoverMode = d.handoverMode ?? current?.handoverMode ?? HandoverMode.COLLECT;
  const collectionNote = d.collectionNote ?? current?.collectionNote ?? null;
  const common = {
    title,
    description: d.description,
    imageUrl,
    isActive: d.isActive,
    handoverMode,
    collectionWeekday: d.collectionWeekday,
    collectionNote,
  };

  let priceCents: number;
  let extra: Record<string, unknown> = {};
  let items: { productId: string; quantity: number }[] | undefined;
  if (d.kind === SubscriptionOfferKind.BOX) {
    priceCents = d.items
      ? d.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
      : (current?.priceCents ?? 0);
    extra = { interval: d.interval };
    items = d.items?.map(({ productId, quantity }) => ({ productId, quantity }));
  } else {
    const weekly = d.weeklyPriceCents ?? current?.weeklyPriceCents ?? null;
    const monthly = d.monthlyPriceCents ?? current?.monthlyPriceCents ?? null;
    const upfront = d.upfrontPriceCents ?? current?.upfrontPriceCents ?? null;
    priceCents = weekly ?? monthly ?? upfront ?? 0;
    const fulfillmentProductId = await upsertMembershipFulfilmentProduct({
      standId: ctx.stand.id,
      ownerId: ctx.ownerId,
      existingProductId: current?.fulfillmentProductId ?? null,
      title,
      priceCents,
      currency: ctx.stand.currency,
      handoverMode,
      collectionNote,
    });
    extra = {
      interval: ShopperSubInterval.WEEKLY,
      termWeeks: d.termWeeks,
      maxMembers: d.maxMembers,
      weeklyPriceCents: weekly,
      monthlyPriceCents: monthly,
      upfrontPriceCents: upfront,
      upfrontBenefitsText: d.upfrontBenefitsText,
      termsText: d.termsText,
      fulfillmentProductId,
    };
    items = current ? undefined : [{ productId: fulfillmentProductId, quantity: 1 }];
  }

  const offer = await prisma.$transaction(async (tx) => {
    const saved = current
      ? await tx.subscriptionOffer.update({ where: { id: current.id }, data: { ...common, ...extra, priceCents } })
      : await tx.subscriptionOffer.create({
          data: {
            ...common,
            ...extra,
            priceCents,
            kind: d.kind,
            slug: d.slug,
            standId: ctx.stand.id,
            ownerId: ctx.ownerId,
            currency: ctx.stand.currency,
            isActive: d.isActive ?? true,
          },
        });
    if (items) {
      await tx.subscriptionOfferProduct.deleteMany({ where: { subscriptionOfferId: saved.id } });
      await tx.subscriptionOfferProduct.createMany({
        data: items.map((i, sortOrder) => ({ ...i, subscriptionOfferId: saved.id, sortOrder })),
      });
    }
    return saved;
  });
  await syncImportedOfferStripe(offer, ctx, (m) => warn(`Row ${row.line}: ${m}`));
}

export const subscriptionsImporter: Importer<SubscriptionRow> = {
  plan: planSubscriptions,
  async apply(plan, ctx): Promise<ImportResult> {
    const warnings: string[] = [];
    let created = 0;
    let updated = 0;
    for (const row of plan.rows) {
      await writeOffer(row, ctx, (m) => warnings.push(m));
      if (row.existingId) updated += 1;
      else created += 1;
    }
    return { created, updated, warnings };
  },
};
