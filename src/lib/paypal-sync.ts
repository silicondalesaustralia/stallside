import { prisma } from "@/lib/prisma";
import {
  getMerchantIntegrationStatus,
  lookupMerchantByTrackingId,
  merchantPaymentsReady,
} from "@/lib/paypal-connect";

/** Persist PayPal merchant status. No revalidatePath — safe during RSC render. */
export async function syncPayPalMerchantStatus(input: {
  ownerId: string;
  trackingId: string;
  existingMerchantId: string | null;
  existingPaymentsEnabled: boolean;
  merchantIdHint?: string | null;
}): Promise<{ merchantId: string | null; ready: boolean }> {
  let merchantId = input.merchantIdHint?.trim() || input.existingMerchantId;
  const wasConnected = Boolean(input.existingMerchantId);

  if (!merchantId) {
    try {
      const looked = await lookupMerchantByTrackingId(input.trackingId);
      merchantId = looked.merchant_id ?? null;
    } catch (error) {
      console.error("PayPal tracking lookup failed", error);
    }
  }

  if (!merchantId) {
    return { merchantId: null, ready: false };
  }

  const status = await getMerchantIntegrationStatus(merchantId);
  const ready = merchantPaymentsReady(status);

  await prisma.owner.update({
    where: { id: input.ownerId },
    data: {
      paypalMerchantId: merchantId,
      paypalOnboardingComplete: ready || Boolean(status.primary_email_confirmed),
      paypalPaymentsEnabled: ready
        ? wasConnected
          ? input.existingPaymentsEnabled
          : true
        : false,
    },
  });

  return { merchantId, ready };
}
