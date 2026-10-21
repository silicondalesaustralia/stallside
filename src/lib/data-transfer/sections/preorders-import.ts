import { prisma } from "@/lib/prisma";
import { HandoverMode, PaymentTiming } from "@/generated/prisma/client";
import type { Importer, ImportResult } from "../context";
import { clearOrphanedPreOrderFlags } from "@/lib/pre-order-pages/orphans";
import { copyImages } from "../image-copy";
import { planPreOrders, type PreOrderRow } from "./preorders-import-plan";

export const preOrdersImporter: Importer<PreOrderRow> = {
  plan: planPreOrders,
  async apply(plan, ctx): Promise<ImportResult> {
    const warnings: string[] = [];
    let created = 0;
    let updated = 0;
    for (const row of plan.rows) {
      const d = row.data;
      const current = row.existingId
        ? await prisma.preOrderPage.findUnique({
            where: { id: row.existingId },
            include: { items: { select: { productId: true } } },
          })
        : null;
      const [imageUrl] =
        d.imageUrl && d.imageUrl !== current?.imageUrl
          ? await copyImages([d.imageUrl], ctx.stand.id, "preorders", (m) => warnings.push(`Row ${row.line}: ${m}`))
          : [];

      const paymentTiming = d.paymentTiming ?? current?.paymentTiming ?? PaymentTiming.PAY_UPFRONT;
      const schedule = {
        orderByAt: d.orderByAt ?? current!.orderByAt,
        collectionAt: d.collectionAt ?? current!.collectionAt,
        collectionNote: d.collectionNote ?? current?.collectionNote ?? null,
        showExactStock: d.showExactStock ?? current?.showExactStock ?? false,
        paymentTiming,
        depositPercent:
          paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE
            ? (d.depositPercent ?? current?.depositPercent ?? null)
            : null,
        handoverMode: d.handoverMode ?? current?.handoverMode ?? HandoverMode.COLLECT,
      };
      const productIds = d.productIds ?? current?.items.map((i) => i.productId) ?? [];

      await prisma.$transaction(async (tx) => {
        const fields = {
          ...schedule,
          title: d.title,
          description: d.description,
          imageUrl,
          isActive: d.isActive,
          hideOnBusinessPage: d.hideOnBusinessPage,
        };
        const page = row.existingId
          ? await tx.preOrderPage.update({ where: { id: row.existingId }, data: fields })
          : await tx.preOrderPage.create({
              data: {
                ...fields,
                standId: ctx.stand.id,
                ownerId: ctx.ownerId,
                slug: d.slug,
                title: d.title ?? d.slug,
                isActive: d.isActive ?? true,
              },
            });
        if (d.productIds) {
          await tx.preOrderPageProduct.deleteMany({ where: { preOrderPageId: page.id } });
          await tx.preOrderPageProduct.createMany({
            data: d.productIds.map((productId, sortOrder) => ({ preOrderPageId: page.id, productId, sortOrder })),
          });
        }
        await tx.product.updateMany({
          where: { id: { in: productIds }, standId: ctx.stand.id },
          data: { ...schedule, isPreOrder: true, preOrderEligible: true },
        });
        const removedIds = (current?.items ?? [])
          .map((i) => i.productId)
          .filter((id) => !productIds.includes(id));
        if (removedIds.length) await clearOrphanedPreOrderFlags(tx, removedIds);
      });
      if (row.existingId) updated += 1;
      else created += 1;
    }
    return { created, updated, warnings };
  },
};
