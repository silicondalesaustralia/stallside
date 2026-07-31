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
  });
  if (!stand?.isActive) {
    return { ok: false, error: "Stand not found." };
  }

  const unsubToken = randomBytes(24).toString("hex");
  const now = new Date();

  await prisma.restockSubscriber.upsert({
    where: {
      standId_email: { standId, email: emailRaw },
    },
    create: {
      standId,
      email: emailRaw,
      status: SubStatus.ACTIVE,
      consentText: RESTOCK_CONSENT_TEXT,
      consentAt: now,
      consentSource: RESTOCK_CONSENT_SOURCE,
      unsubToken,
    },
    update: {
      status: SubStatus.ACTIVE,
      consentText: RESTOCK_CONSENT_TEXT,
      consentAt: now,
      consentSource: RESTOCK_CONSENT_SOURCE,
      unsubToken,
      unsubscribedAt: null,
    },
  });

  return { ok: true };
}
