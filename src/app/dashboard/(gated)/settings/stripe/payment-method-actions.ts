"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { setConnectPaymentMethodPreference } from "@/lib/stripe-payment-method-config";
import { requestCapabilityForPaymentMethod } from "@/lib/stripe-connect-capabilities";

export async function toggleConnectPaymentMethod(input: {
  configurationId: string;
  method: string;
  enabled: boolean;
}): Promise<{ error?: string; methods?: Awaited<ReturnType<typeof setConnectPaymentMethodPreference>> }> {
  try {
    const { owner } = await requireOwner();
    if (!isStripeConfigured() || !owner.stripeAccountId) {
      return { error: "Stripe is not connected." };
    }
    if (!/^[a-z0-9_]+$/i.test(input.method)) {
      return { error: "Invalid payment method." };
    }
    if (!input.configurationId.startsWith("pmc_")) {
      return { error: "Invalid configuration." };
    }

    if (input.enabled) {
      try {
        await requestCapabilityForPaymentMethod({
          stripeAccountId: owner.stripeAccountId,
          method: input.method,
        });
      } catch (capError) {
        console.warn("Capability request failed", input.method, capError);
      }
    }

    const methods = await setConnectPaymentMethodPreference({
      stripeAccountId: owner.stripeAccountId,
      configurationId: input.configurationId,
      method: input.method,
      preference: input.enabled ? "on" : "off",
      currency: owner.billingCurrency || "AUD",
    });
    revalidatePath("/dashboard/settings/stripe");
    return { methods };
  } catch (error) {
    console.error("Payment method toggle failed", error);
    const message =
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Could not update payment method.";
    return { error: message };
  }
}
