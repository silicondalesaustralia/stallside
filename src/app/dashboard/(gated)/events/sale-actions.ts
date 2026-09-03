"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  FulfilmentStatus,
  SellerEventStatus,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCashSaleOrder } from "@/lib/ops/cash-sale";
import { linkOrderToCustomer } from "@/lib/catalogue/customers";

export async function quickSaleAtEvent(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const eventId = String(formData.get("eventId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const qty = Number.parseInt(String(formData.get("qty") ?? "1"), 10);
  if (!Number.isFinite(qty) || qty < 1) throw new Error("Invalid quantity");

  const event = await prisma.sellerEvent.findFirst({
    where: { id: eventId, ownerId: owner.id },
    include: {
      stand: { select: { id: true, currency: true } },
      products: { where: { productId }, take: 1 },
    },
  });
  if (!event) throw new Error("Event not found");
  if (event.status !== SellerEventStatus.LIVE) {
    throw new Error("Set event LIVE before recording sales");
  }
  if (event.products.length === 0) {
    throw new Error("Add this product to the event first");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ownerId: owner.id,
      standId: event.standId,
      isArchived: false,
    },
  });
  if (!product) throw new Error("Product not found");

  const customerName =
    String(formData.get("customerName") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  const order = await prisma.$transaction(async (tx) => {
    const created = await createCashSaleOrder(tx, {
      ownerId: owner.id,
      standId: event.stand.id,
      currency: event.stand.currency,
      line: {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        stockQuantity: product.stockQuantity,
        quantity: qty,
      },
      customerName,
      email,
      sellerEventId: event.id,
      fulfilmentStatus: FulfilmentStatus.COLLECTED,
      reason: `Market sale: ${event.name}`,
    });

    await tx.sellerEventProduct.update({
      where: { eventId_productId: { eventId: event.id, productId } },
      data: { soldQty: { increment: qty } },
    });

    return created;
  });

  await linkOrderToCustomer({
    orderId: order.id,
    ownerId: owner.id,
    email,
    name: customerName,
  });

  revalidatePath(`/dashboard/events/${eventId}`);
  redirect(`/dashboard/events/${eventId}?sold=1`);
}
