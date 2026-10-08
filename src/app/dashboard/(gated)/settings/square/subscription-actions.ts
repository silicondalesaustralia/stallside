"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { isSquareSubscriptionsEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";

/** New subscription and membership signups go through Square when on (renewals keep billing either way). */
export async function setSquareSubscriptionsEnabled(enabled: boolean) {
  try {
    if (!isSquareSubscriptionsEnabled()) return { error: "Square subscriptions aren't available yet." };
    const { owner } = await requireOwner();
    const conn = await getSquareConnection(owner.id);
    if (!conn || conn.status !== "ACTIVE") return { error: "Connect Square first." };
    if (enabled && !conn.paymentsEnabled) return { error: "Turn on online Vendl payments first." };
    await prisma.externalCommerceConnection.update({
      where: { id: conn.id },
      data: { subscriptionsEnabled: enabled },
    });
    revalidatePath("/dashboard/settings/square");
    return { ok: true as const };
  } catch (error) {
    console.error("Square subscriptions toggle failed", error);
    return { error: "Could not save. Try again." };
  }
}
