"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { InventorySource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

async function ownedMember(ownerId: string, memberId: string) {
  return prisma.standMember.findFirst({
    where: { id: memberId, ownerId },
    include: { stand: { select: { id: true, slug: true } } },
  });
}

/** Archive a product that belongs only to this supplier (not a linked owner product). */
export async function deleteSupplierProduct(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      memberId: member.id,
      ownerId: owner.id,
      standId: member.standId,
    },
    select: { id: true },
  });
  if (!product) return { error: "Product not found." };

  await prisma.product.update({
    where: { id: product.id },
    data: { isArchived: true, isActive: false, isHidden: false },
  });

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/supply");
  revalidateTag(standCatalogTag(member.stand.slug), "max");
  return { ok: true as const };
}

/** Remove the supplier and their access. Exclusive products are archived. */
export async function deleteSupplier(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const member = await ownedMember(owner.id, memberId);
  if (!member) redirect("/dashboard/suppliers");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { memberId: member.id, ownerId: owner.id },
        data: { isArchived: true, isActive: false, isHidden: false },
      });
      await tx.supplierProductAccess.deleteMany({
        where: { memberId: member.id },
      });
      await tx.stockLot.deleteMany({
        where: { memberId: member.id, status: "PENDING" },
      });

      const lots = await tx.stockLot.findMany({
        where: {
          memberId: member.id,
          status: "ACTIVE",
          quantityRemaining: { gt: 0 },
        },
      });
      for (const lot of lots) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: lot.productId },
          select: { stockQuantity: true },
        });
        const take = Math.min(lot.quantityRemaining, product.stockQuantity);
        const next = product.stockQuantity - take;
        await tx.product.update({
          where: { id: lot.productId },
          data: { stockQuantity: next },
        });
        await tx.inventoryAdjustment.create({
          data: {
            productId: lot.productId,
            ownerId: owner.id,
            standId: member.standId,
            memberId: member.id,
            changeQuantity: -take,
            previousQuantity: product.stockQuantity,
            newQuantity: next,
            reason: `${member.name} removed (supplier deleted)`,
            source: InventorySource.OWNER_MANUAL,
          },
        });
        await tx.stockLot.update({
          where: { id: lot.id },
          data: { quantityRemaining: 0 },
        });
      }

      await tx.standMember.delete({ where: { id: member.id } });
    });
  } catch (error) {
    console.error("Delete supplier failed", error);
    return { error: "Could not delete this supplier." };
  }

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard/products");
  revalidatePath("/supply");
  revalidateTag(standCatalogTag(member.stand.slug), "max");
  redirect("/dashboard/suppliers");
}
