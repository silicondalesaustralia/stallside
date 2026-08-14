"use server";

import { ChannelInterestKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";
import { notifyChannelInterest } from "@/lib/notify-channel-interest";

export async function submitChannelInterest(formData: FormData) {
  const standSlug = String(formData.get("standSlug") ?? "")
    .trim()
    .toLowerCase();
  const kindRaw = String(formData.get("kind") ?? "");
  const email = normalizeReceiptEmail(String(formData.get("email") ?? ""));
  const kind =
    kindRaw === "PREORDER"
      ? ChannelInterestKind.PREORDER
      : kindRaw === "SUBSCRIPTION"
        ? ChannelInterestKind.SUBSCRIPTION
        : null;

  if (!standSlug || !kind) return { error: "Invalid request." };
  if (!email.includes("@")) return { error: "Enter a valid email." };

  const stand = await prisma.stand.findFirst({
    where: { slug: standSlug, isActive: true },
    select: { id: true },
  });
  if (!stand) return { error: "Stand not found." };

  try {
    await prisma.channelInterest.create({
      data: { standId: stand.id, kind, email },
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code === "P2002") return { ok: true as const };
    console.error("Channel interest save failed", error);
    return { error: "Could not send. Try again." };
  }

  try {
    const notified = await notifyChannelInterest({ standSlug, kind, email });
    if (notified && "error" in notified) return notified;
    return { ok: true as const };
  } catch (error) {
    console.error("Channel interest notify failed", error);
    return { ok: true as const };
  }
}
