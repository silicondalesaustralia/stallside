"use server";

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  isRestockAlertsEnabled,
  RESTOCK_CONSENT_SOURCE,
  RESTOCK_CONSENT_TEXT,
} from "@/lib/restock-alerts";
import { SubStatus } from "@/generated/prisma/client";

export type RestockSubscribeState = {
  ok: boolean;
  error?: string;
};

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function subscribeRestockAlert(
  _prev: RestockSubscribeState,
  formData: FormData,
): Promise<RestockSubscribeState> {
  if (!isRestockAlertsEnabled()) {
    return { ok: false, error: "Restock alerts are unavailable." };
  }

  const standId = asTrimmedString(formData.get("standId"));
  const emailRaw = asTrimmedString(formData.get("email")).toLowerCase();

  if (!standId) {
    return { ok: false, error: "Stand not found." };
  }
  if (
    !emailRaw ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ||
    emailRaw.length > 200
  ) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const stand = await prisma.stand.findUnique({
    where: { id: standId },
    select: { id: true, isActive: true, ownerId: true },
  });
  if (!stand?.isActive) {
    return { ok: false, error: "Stand not found." };
  }

  const unsubToken = randomBytes(24).toString("hex");
  const now = new Date();

  let customerId: string | null = null;
  try {
    const { ensureCustomer } = await import("@/lib/catalogue/customers");
    const customer = await ensureCustomer({
      ownerId: stand.ownerId,
      email: emailRaw,
      source: "restock",
      marketingConsent: true,
    });
    customerId = customer?.id ?? null;
  } catch (err) {
    console.error("Customer link failed", err);
  }

  await prisma.restockSubscriber.upsert({
    where: {
      standId_email: { standId, email: emailRaw },
    },
    create: {
      standId,
      email: emailRaw,
      customerId,
      status: SubStatus.ACTIVE,
      consentText: RESTOCK_CONSENT_TEXT,
      consentAt: now,
      consentSource: RESTOCK_CONSENT_SOURCE,
      unsubToken,
    },
    update: {
      status: SubStatus.ACTIVE,
      customerId: customerId ?? undefined,
      consentText: RESTOCK_CONSENT_TEXT,
      consentAt: now,
      consentSource: RESTOCK_CONSENT_SOURCE,
      unsubToken,
      unsubscribedAt: null,
    },
  });

  return { ok: true };
}
