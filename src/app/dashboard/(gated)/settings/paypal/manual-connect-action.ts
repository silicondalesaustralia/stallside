"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import {
  isPayPalConfigured,
  isPayPalConnectAvailable,
  normalizePayPalMerchantId,
} from "@/lib/paypal";

export type ManualPayPalState = { error?: string; ok?: boolean };

export async function saveManualPayPalMerchantId(
  formData: FormData,
): Promise<ManualPayPalState> {
  const { owner, user } = await requireOwnerWrite();
  if (!ownerHasProAccess(owner, { email: user.email, role: user.role })) {
    return { error: "PayPal requires Vendl Pro." };
  }
  if (!isPayPalConnectAvailable() || !isPayPalConfigured()) {
    return { error: "PayPal is not available yet." };
  }

  try {
    const raw = String(formData.get("merchantId") ?? "");
    if (!raw.trim()) {
      await prisma.owner.update({
        where: { id: owner.id },
        data: {
          paypalMerchantId: null,
          paypalOnboardingComplete: false,
          paypalPaymentsEnabled: false,
        },
      });
      revalidatePath("/dashboard/settings/paypal");
      return { ok: true };
    }

    const merchantId = normalizePayPalMerchantId(raw);
    if (!merchantId) {
      return {
        error:
          "That doesn't look like a PayPal Merchant Account ID (13 letters and numbers).",
      };
    }

    const changed = merchantId !== owner.paypalMerchantId;
    await prisma.owner.update({
      where: { id: owner.id },
      data: {
        paypalMerchantId: merchantId,
        paypalOnboardingComplete: true,
        paypalPaymentsEnabled: changed ? true : owner.paypalPaymentsEnabled,
      },
    });
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/settings/paypal");
    return { ok: true };
  } catch (error) {
    console.error("Save PayPal merchant id failed", error);
    return { error: "Couldn't save your PayPal Merchant ID. Try again." };
  }
}
