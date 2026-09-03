"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CustomOrderRequestStatus,
  FulfilmentStatus,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCashSaleOrder } from "@/lib/ops/cash-sale";
import { linkOrderToCustomer } from "@/lib/catalogue/customers";

export async function convertRequestToOrder(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const requestId = String(formData.get("requestId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const standId = String(formData.get("standId") ?? "");
  const qty = Number.parseInt(String(formData.get("qty") ?? "1"), 10);
  if (!Number.isFinite(qty) || qty < 1) throw new Error("Invalid quantity");

  const req = await prisma.customOrderRequest.findFirst({
    where: { id: requestId, ownerId: owner.id },
  });
  if (!req) throw new Error("Request not found");
  if (req.status === CustomOrderRequestStatus.CONVERTED) {
    throw new Error("Already converted");
  }
  if (req.status !== CustomOrderRequestStatus.ACCEPTED) {
    throw new Error("Accept the request before converting");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ownerId: owner.id,
      standId,
      isArchived: false,
    },
  });
  if (!product) throw new Error("Product not found");

  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true, currency: true },
  });
  if (!stand) throw new Error("Stand not found");

  const order = await prisma.$transaction(async (tx) => {
    const created = await createCashSaleOrder(tx, {
      ownerId: owner.id,
      standId: stand.id,
      currency: stand.currency,
      line: {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        stockQuantity: product.stockQuantity,
        quantity: qty,
      },
      customerName: req.customerName,
      email: req.email,
      phone: req.phone,
      customOrderRequestId: req.id,
      fulfilmentStatus: FulfilmentStatus.NEW,
      reason: "Custom order conversion",
    });
    await tx.customOrderRequest.update({
      where: { id: req.id },
      data: {
        status: CustomOrderRequestStatus.CONVERTED,
        sellerNotes:
          String(formData.get("sellerNotes") ?? "").trim() || req.sellerNotes,
      },
    });
    return created;
  });

  await linkOrderToCustomer({
    orderId: order.id,
    ownerId: owner.id,
    email: req.email,
    name: req.customerName,
    phone: req.phone,
  });

  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/requests/${requestId}`);
  revalidatePath("/dashboard/fulfilment/orders");
  redirect(`/dashboard/forms/requests/${requestId}?converted=${order.id}`);
}
