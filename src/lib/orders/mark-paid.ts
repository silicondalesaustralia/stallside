import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

/** Owner confirms the cash or PayID money actually arrived. */
export async function markOwnerOrderPaid(
  ownerId: string,
  orderId: string,
): Promise<{ ok: true } | { error: string }> {
  const id = orderId.trim();
  const result = await prisma.order.updateMany({
    where: {
      id,
      ownerId,
      paymentStatus: PaymentStatus.CUSTOMER_CONFIRMED,
      paymentMethod: { in: [PaymentMethod.CASH, PaymentMethod.LOCAL_TRANSFER] },
    },
    data: { paymentStatus: PaymentStatus.PAID },
  });
  if (result.count === 0) return { error: "This order can't be marked paid." };
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
  return { ok: true };
}
