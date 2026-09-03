import {
  isPayPalLiveMode,
  isPayPalMarketplaceMode,
  assertSellerPayPalMerchantId,
} from "@/lib/paypal";
import { createPayPalCheckoutOrder } from "@/lib/paypal-orders";
import { prisma } from "@/lib/prisma";
import {
  getMerchantIntegrationStatus,
  lookupMerchantByTrackingId,
  merchantPaymentsReady,
} from "@/lib/paypal-connect";

/** Sandbox: status API often 401 — verify seller can take marketplace checkout. */
async function assertSellerMarketplaceCheckoutReady(merchantId: string) {
  if (!isPayPalMarketplaceMode()) return;
  try {
    await createPayPalCheckoutOrder({
      merchantId,
      orderId: `sync-validate-${Date.now()}`,
      currency: "USD",
      totalCents: 100,
      platformFeeCents: 3,
      description: "Vendl PayPal connect check",
      successUrl: "https://vendl.app",
      cancelUrl: "https://vendl.app",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("target_client_id")) {
      throw new Error(
        "That seller merchant ID is not onboarded to Vendl marketplace. Use your Test Store account ID from PayPal Sandbox, or finish Connect PayPal (marketplace) onboarding for that business.",
      );
    }
    throw error;
  }
}

/** Persist PayPal merchant status. No revalidatePath - safe during RSC render. */
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
      throw error;
    }
  }

  if (!merchantId) {
    throw new Error(
      "PayPal merchant not found yet. Wait a minute and sync again, or paste your seller merchant ID.",
    );
  }

  assertSellerPayPalMerchantId(merchantId);

  const merchantChanged =
    Boolean(input.merchantIdHint?.trim()) ||
    merchantId !== (input.existingMerchantId?.trim() ?? "");

  let status;
  try {
    status = await getMerchantIntegrationStatus(merchantId);
  } catch (error) {
    // Sandbox: status API may 401 with stale BN/partner config — trust pasted seller id.
    if (
      input.merchantIdHint?.trim() &&
      !isPayPalLiveMode()
    ) {
      console.warn(
        "PayPal merchant status API failed; validating seller id for sandbox",
        error,
      );
      if (merchantChanged) {
        await assertSellerMarketplaceCheckoutReady(merchantId);
      }
      await prisma.owner.update({
        where: { id: input.ownerId },
        data: {
          paypalMerchantId: merchantId,
          paypalOnboardingComplete: true,
          paypalPaymentsEnabled: true,
        },
      });
      return { merchantId, ready: true };
    }
    throw error;
  }

  const ready = merchantPaymentsReady(status);

  if (merchantChanged) {
    await assertSellerMarketplaceCheckoutReady(merchantId);
  }

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
