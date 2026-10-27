"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

/** Owner confirms the cash or PayID money actually arrived. */
export async function markOrderPaid(orderId: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    const result = await prisma.order.updateMany({
      where: {
        id: orderId.trim(),
        ownerId: owner.id,
        paymentStatus: PaymentStatus.CUSTOMER_CONFIRMED,
        paymentMethod: { in: [PaymentMethod.CASH, PaymentMethod.LOCAL_TRANSFER] },
      },
      data: { paymentStatus: PaymentStatus.PAID },
    });
    if (result.count === 0) return { error: "This order can't be marked paid." };
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { ok: true };
  } catch (error) {
    console.error("[orders] markOrderPaid failed", error);
    return { error: "Could not update the order. Try again." };
  }
}
