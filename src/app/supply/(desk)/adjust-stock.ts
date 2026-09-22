"use server";

import { revalidatePath } from "next/cache";
import { InventorySource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSupplier } from "@/lib/suppliers/access";
import { createContributionLot } from "@/lib/suppliers/contribute";
import { notifySupplierStock } from "@/lib/suppliers/notify-stock";
import { removeSupplierContribution } from "@/lib/suppliers/remove-contribution";

type Membership = Awaited<ReturnType<typeof requireSupplier>>["membership"];

export async function adjustSupplierStock(formData: FormData) {
  const standId = String(formData.get("standId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const mode = String(formData.get("mode") ?? "increase");
  const amount = Number.parseInt(String(formData.get("amount") ?? ""), 10);
  const { membership } = await requireSupplier(standId);
  if (!productId || !Number.isInteger(amount) || amount < 1) {
    return { error: "Enter a quantity." };
  }
  if (mode !== "increase" && mode !== "decrease") {
    return { error: "Choose add or remove." };
  }

  const access = await prisma.supplierProductAccess.findFirst({
    where: {
      memberId: membership.id,
      productId,
      product: { standId: membership.standId },
    },
  });
  const owned = access
    ? null
    : await prisma.product.findFirst({
        where: {
          id: productId,
          memberId: membership.id,
          standId: membership.standId,
        },
      });
  if (!access && !owned) return { error: "Product not found." };

  try {
    if (access) {
      const err = await adjustLinked(membership, access, mode, amount);
      if (err) return err;
    } else if (owned) {
      const err = await adjustOwned(membership, owned, mode, amount);
      if (err) return err;
    }
  } catch (error) {
    console.error("Supplier stock adjust failed", error);
    return { error: "Could not update stock." };
  }

  revalidatePath("/supply");
  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${membership.id}`);
  return { ok: true as const };
}

async function adjustLinked(
  membership: Membership,
  access: { productId: string; supplierUnitCents: number; autoApprove: boolean },
  mode: string,
  amount: number,
) {
  if (mode === "increase") {
    const { productName } = await prisma.$transaction((tx) =>
      createContributionLot(tx, {
        productId: access.productId,
        ownerId: membership.stand.ownerId,
        standId: membership.standId,
        memberId: membership.id,
        memberName: membership.name,
        supplierUnitCents: access.supplierUnitCents,
        quantity: amount,
        status: access.autoApprove ? "ACTIVE" : "PENDING",
      }),
    );
    await notifySafe(membership, access.productId, productName, amount);
    return;
  }
  const result = await prisma.$transaction((tx) =>
    removeSupplierContribution(tx, {
      productId: access.productId,
      ownerId: membership.stand.ownerId,
      standId: membership.standId,
      memberId: membership.id,
      memberName: membership.name,
      quantity: amount,
    }),
  );
  if ("error" in result) return result;
  await notifySafe(membership, access.productId, result.productName, -amount);
}

async function adjustOwned(
  membership: Membership,
  product: { id: string; stockQuantity: number; name: string },
  mode: string,
  amount: number,
) {
  const previous = product.stockQuantity;
  const next =
    mode === "increase" ? previous + amount : Math.max(0, previous - amount);
  const change = next - previous;
  if (change === 0) return { error: "Stock is already zero." as const };

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: next },
    }),
    prisma.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: membership.stand.ownerId,
        standId: membership.standId,
        memberId: membership.id,
        changeQuantity: change,
        previousQuantity: previous,
        newQuantity: next,
        reason: `${membership.name} updated stock`,
        source: InventorySource.OWNER_MANUAL,
      },
    }),
  ]);
  await notifySafe(membership, product.id, product.name, change);
}

async function notifySafe(
  membership: Membership,
  productId: string,
  productName: string,
  changeQuantity: number,
) {
  try {
    await notifySupplierStock({
      ownerId: membership.stand.ownerId,
      standId: membership.standId,
      standName: membership.stand.name,
      timezone: membership.stand.timezone,
      memberName: membership.name,
      productId,
      productName,
      changeQuantity,
      at: new Date(),
    });
  } catch (error) {
    console.error("Supplier stock notify failed", error);
  }
}
