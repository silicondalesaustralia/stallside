"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PickupLocationType } from "@/generated/prisma/client";

export async function savePickupLocation(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const publicLabel = String(formData.get("publicLabel") ?? "").trim().slice(0, 120);
  const type = String(formData.get("type") ?? "OTHER") as PickupLocationType;
  const suburb = String(formData.get("suburb") ?? "").trim().slice(0, 80) || null;
  const addressLine1 =
    String(formData.get("addressLine1") ?? "").trim().slice(0, 200) || null;
  const publicInstructions =
    String(formData.get("publicInstructions") ?? "").trim().slice(0, 500) || null;
  const privateInstructions =
    String(formData.get("privateInstructions") ?? "").trim().slice(0, 500) || null;
  const showFullAddressBeforePurchase =
    formData.get("showFullAddressBeforePurchase") === "on";

  if (!name || !publicLabel) {
    redirect("/dashboard/fulfilment/locations?error=required");
  }

  if (id) {
    await prisma.pickupLocation.updateMany({
      where: { id, ownerId: owner.id },
      data: {
        name,
        publicLabel,
        type,
        suburb,
        addressLine1,
        publicInstructions,
        privateInstructions,
        showFullAddressBeforePurchase,
      },
    });
  } else {
    await prisma.pickupLocation.create({
      data: {
        ownerId: owner.id,
        name,
        publicLabel,
        type,
        suburb,
        addressLine1,
        publicInstructions,
        privateInstructions,
        showFullAddressBeforePurchase,
      },
    });
  }

  revalidatePath("/dashboard/fulfilment/locations");
  redirect("/dashboard/fulfilment/locations?saved=1");
}

export async function togglePickupLocation(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const loc = await prisma.pickupLocation.findFirst({
    where: { id, ownerId: owner.id },
  });
  if (!loc) return;
  await prisma.pickupLocation.update({
    where: { id },
    data: { isActive: !loc.isActive },
  });
  revalidatePath("/dashboard/fulfilment/locations");
}
