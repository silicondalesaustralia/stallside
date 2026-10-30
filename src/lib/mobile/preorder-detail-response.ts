import type { PreOrderDetailResponse } from "@/contracts/mobile/preorders";
import { getOwnerPreOrderPage } from "@/lib/pre-order-pages/service";
import { toMobilePreOrderItems, toMobilePreOrderPage } from "@/lib/mobile/preorder-dto";
import { standQrDataUrl } from "@/lib/stand-qr";
import { payOptionsOf } from "@/lib/pre-order-pay-options";
import { loadPreOrderCardRail } from "@/lib/preorder-card-rail";
import type { OwnerPaymentReady } from "@/lib/stand-payment-brands";
import { mobileError, mobileJson } from "@/lib/mobile/http";

/** One pre-order page as the app shows it, or 404. */
export async function preOrderDetailResponse(owner: OwnerPaymentReady & { id: string }, pageId: string) {
  const [detail, rail] = await Promise.all([getOwnerPreOrderPage(owner.id, pageId), loadPreOrderCardRail(owner)]);
  if (!detail) return mobileError(404, "Pre-order page not found.");
  const page = toMobilePreOrderPage(detail);
  return mobileJson<PreOrderDetailResponse>({
    page,
    collectionNote: detail.collectionNote,
    paymentTiming: detail.paymentTiming,
    paymentOptions: payOptionsOf(detail),
    cardReady: rail.cardReady,
    depositPercent: detail.depositPercent,
    handoverMode: detail.handoverMode,
    currency: detail.stand.currency,
    items: toMobilePreOrderItems(detail),
    qrImage: await standQrDataUrl(page.url, 720),
  });
}
