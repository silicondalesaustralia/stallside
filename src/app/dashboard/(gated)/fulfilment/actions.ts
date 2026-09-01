"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  DeliveryZoneRuleKind,
  FulfilmentOptionKind,
  HandoverMode,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";

function parseIntField(raw: FormDataEntryValue | null): number | null {
  const n = parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) ? n : null;
}

export async function savePickupWindow(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const label = String(formData.get("label") ?? "").trim().slice(0, 120) || null;
  const pickupLocationId =
    String(formData.get("pickupLocationId") ?? "").trim() || null;
  const weekday = parseIntField(formData.get("weekday"));
  const startTimeMin = parseIntField(formData.get("startTimeMin"));
  const endTimeMin = parseIntField(formData.get("endTimeMin"));
  const orderCloseWeekday = parseIntField(formData.get("orderCloseWeekday"));
  const orderCloseTimeMin = parseIntField(formData.get("orderCloseTimeMin"));

  const window = await prisma.pickupWindow.create({
    data: {
      ownerId: owner.id,
      pickupLocationId,
      label,
      recurrence: PickupWindowRecurrence.WEEKLY,
      weekday,
      startTimeMin,
      endTimeMin,
      orderCloseWeekday,
      orderCloseTimeMin,
      timezone: owner.defaultTimezone,
    },
  });

  const loc = pickupLocationId
    ? await prisma.pickupLocation.findFirst({
        where: { id: pickupLocationId, ownerId: owner.id },
      })
    : null;

  await prisma.fulfilmentOption.create({
    data: {
      ownerId: owner.id,
      kind: FulfilmentOptionKind.PICKUP,
      label: label ?? loc?.publicLabel ?? "Pickup",
      pickupLocationId,
      pickupWindowId: window.id,
      handoverMode: HandoverMode.COLLECT,
      channels: ["ONLINE", "STAND"],
    },
  });

  revalidatePath("/dashboard/fulfilment/pickup");
  redirect("/dashboard/fulfilment/pickup?saved=1");
}

export async function saveDeliveryZone(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const deliveryFeeCents = parseIntField(formData.get("deliveryFeeCents")) ?? 0;
  const minOrderCents = parseIntField(formData.get("minOrderCents")) ?? 0;
  const postcodes = String(formData.get("postcodes") ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const suburbs = String(formData.get("suburbs") ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name) redirect("/dashboard/fulfilment/delivery?error=name");

  const zone = await prisma.deliveryZone.create({
    data: {
      ownerId: owner.id,
      name,
      deliveryFeeCents,
      minOrderCents,
      timezone: owner.defaultTimezone,
      rules: {
        create: [
          ...postcodes.map((value) => ({
            kind: DeliveryZoneRuleKind.POSTCODE,
            value: value.toUpperCase(),
          })),
          ...suburbs.map((value) => ({
            kind: DeliveryZoneRuleKind.SUBURB,
            value: value.toUpperCase(),
          })),
        ],
      },
    },
  });

  await prisma.fulfilmentOption.create({
    data: {
      ownerId: owner.id,
      kind: FulfilmentOptionKind.DELIVERY,
      label: name,
      deliveryZoneId: zone.id,
      handoverMode: HandoverMode.DELIVER,
      feeCents: deliveryFeeCents,
      channels: ["ONLINE"],
    },
  });

  revalidatePath("/dashboard/fulfilment/delivery");
  redirect("/dashboard/fulfilment/delivery?saved=1");
}
