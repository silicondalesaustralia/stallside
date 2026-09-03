"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SellerEventStatus } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createSellerEvent(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const standId = String(formData.get("standId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const startsRaw = String(formData.get("startsAt") ?? "");
  const startsAt = new Date(startsRaw);
  if (Number.isNaN(startsAt.getTime())) throw new Error("Start time required");

  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true },
  });
  if (!stand) throw new Error("Stand not found");

  const endsRaw = String(formData.get("endsAt") ?? "").trim();
  const endsAt = endsRaw ? new Date(endsRaw) : null;

  const created = await prisma.sellerEvent.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name,
      locationLabel: String(formData.get("locationLabel") ?? "").trim() || null,
      startsAt,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/dashboard/events");
  redirect(`/dashboard/events/${created.id}`);
}

export async function setSellerEventStatus(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "").toUpperCase();
  if (
    statusRaw !== SellerEventStatus.DRAFT &&
    statusRaw !== SellerEventStatus.LIVE &&
    statusRaw !== SellerEventStatus.CLOSED
  ) {
    throw new Error("Invalid status");
  }
  const event = await prisma.sellerEvent.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!event) throw new Error("Event not found");

  await prisma.sellerEvent.update({
    where: { id },
    data: { status: statusRaw as SellerEventStatus },
  });
  revalidatePath(`/dashboard/events/${id}`);
  redirect(`/dashboard/events/${id}`);
}

export async function addEventProduct(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const eventId = String(formData.get("eventId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const allocatedRaw = String(formData.get("allocatedQty") ?? "").trim();
  const allocatedQty = allocatedRaw
    ? Number.parseInt(allocatedRaw, 10)
    : null;

  const event = await prisma.sellerEvent.findFirst({
    where: { id: eventId, ownerId: owner.id },
    select: { id: true, standId: true },
  });
  if (!event) throw new Error("Event not found");

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ownerId: owner.id,
      standId: event.standId,
      isArchived: false,
    },
    select: { id: true },
  });
  if (!product) throw new Error("Product not found");

  await prisma.sellerEventProduct.upsert({
    where: { eventId_productId: { eventId, productId } },
    create: {
      eventId,
      productId,
      allocatedQty:
        allocatedQty != null && Number.isFinite(allocatedQty)
          ? allocatedQty
          : null,
    },
    update: {
      allocatedQty:
        allocatedQty != null && Number.isFinite(allocatedQty)
          ? allocatedQty
          : null,
    },
  });
  revalidatePath(`/dashboard/events/${eventId}`);
  redirect(`/dashboard/events/${eventId}`);
}
