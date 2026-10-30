import { revalidatePath } from "next/cache";
import { PaymentTiming } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { preOrderPagePath } from "@/lib/preorder-page";
import type { PreOrderPaymentTiming } from "@/lib/pre-order";
import { depositPercentOf, payOptionsError, sortPayOptions } from "@/lib/pre-order-pay-options";
import { loadPreOrderCardRail, SQUARE_DEPOSIT_RECONNECT_ERROR } from "@/lib/preorder-card-rail";
import type { OwnerPaymentReady } from "@/lib/stand-payment-brands";

type Result = { ok: true } | { error: string };

/**
 * Changes only how shoppers can pay on one pre-order page. Like the web page editor, the
 * page's products take the same settings, and the first option is the checkout default.
 */
export async function setOwnerPreOrderPayOptions(
  owner: OwnerPaymentReady & { id: string },
  pageId: string,
  input: { paymentOptions: readonly PreOrderPaymentTiming[]; depositPercent: number | null },
): Promise<Result> {
  const page = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId: owner.id },
    select: {
      id: true,
      slug: true,
      standId: true,
      handoverMode: true,
      stand: { select: { slug: true } },
      items: { select: { productId: true } },
    },
  });
  if (!page) return { error: "Pre-order page not found." };

  const options = sortPayOptions(input.paymentOptions);
  // Pages save without payments connected; the public page holds ordering until a card provider is ready.
  const optionsError = payOptionsError({ options, handoverMode: page.handoverMode, cardAllowed: true });
  if (optionsError) return { error: optionsError };

  let depositPercent: number | null = null;
  if (options.includes("DEPOSIT_THEN_BALANCE")) {
    const pct = depositPercentOf(input.depositPercent ?? 30);
    if (!pct.ok) return { error: pct.error };
    depositPercent = pct.value;
    const rail = await loadPreOrderCardRail(owner);
    if (rail.squareNeedsReconnectForDeposits) return { error: SQUARE_DEPOSIT_RECONNECT_ERROR };
  }

  const data = {
    paymentTiming: PaymentTiming[options[0]],
    paymentOptions: options.map((o) => PaymentTiming[o]),
    depositPercent,
  };
  await prisma.$transaction([
    prisma.preOrderPage.update({ where: { id: page.id }, data }),
    prisma.product.updateMany({
      where: { id: { in: page.items.map((i) => i.productId) }, standId: page.standId },
      data,
    }),
  ]);

  revalidatePath("/dashboard/pre-order-pages");
  revalidatePath(`/dashboard/pre-order-pages/${page.id}`);
  revalidatePath("/dashboard/products");
  revalidatePath(`/s/${page.stand.slug}`);
  revalidatePath(preOrderPagePath(page.stand.slug, page.slug));
  return { ok: true };
}
