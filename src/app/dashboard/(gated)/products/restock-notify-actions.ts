"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import {
  isRestockAlertsEnabled,
  RESTOCK_ALERT_COOLDOWN_HOURS,
} from "@/lib/restock-alerts";
import { sendRestockNotifications } from "@/lib/notify-restock";

export type NotifyRestockState = {
  ok: boolean;
  error?: string;
  recipientCount?: number;
};

export async function notifyRestockSubscribers(
  _prev: NotifyRestockState,
  formData: FormData,
): Promise<NotifyRestockState> {
  if (!isRestockAlertsEnabled()) {
    return { ok: false, error: "Restock alerts are unavailable." };
  }

  const { user, owner } = await requireOwner();
  if (
    !ownerHasCardTierAccess(owner, {
      email: user.email,
      role: user.role,
      lifetimeAccess: owner.lifetimeAccess,
    })
  ) {
    return { ok: false, error: "Restock alerts require the Card plan." };
  }

  const standId =
    typeof formData.get("standId") === "string"
      ? (formData.get("standId") as string).trim()
      : "";
  const ownerMessage =
    typeof formData.get("ownerMessage") === "string"
      ? (formData.get("ownerMessage") as string).trim().slice(0, 500)
      : "";

  if (!standId) {
    return { ok: false, error: "Stand not found." };
  }

  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true, name: true, slug: true },
  });
  if (!stand) {
    return { ok: false, error: "Stand not found." };
  }

  if (RESTOCK_ALERT_COOLDOWN_HOURS > 0) {
    const since = new Date(
      Date.now() - RESTOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
    );
    const recent = await prisma.restockNotification.findFirst({
      where: { standId: stand.id, sentAt: { gte: since } },
      orderBy: { sentAt: "desc" },
      select: { sentAt: true },
    });
    if (recent) {
      const availableAt = new Date(
        recent.sentAt.getTime() + RESTOCK_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000,
      );
      const time = availableAt.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      return {
        ok: false,
        error: `You notified customers recently — available again at ${time}.`,
      };
    }
  }

  const { recipientCount } = await sendRestockNotifications({
    standId: stand.id,
    standName: stand.name,
    standSlug: stand.slug,
    sentByUserId: user.id,
    ownerMessage: ownerMessage || undefined,
  });

  revalidatePath("/dashboard/products");
  return { ok: true, recipientCount };
}
