"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { createContributionLot } from "@/lib/suppliers/contribute";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

/** Owner records supplier stock on a linked product (same as the supplier adding). */
export async function addSupplierStockAsOwner(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const amount = Number.parseInt(String(formData.get("amount") ?? ""), 10);
  if (!memberId || !productId || !Number.isInteger(amount) || amount < 1) {
    return { error: "Enter a quantity." };
  }

  const access = await prisma.supplierProductAccess.findFirst({
    where: {
      memberId,
      productId,
      member: { ownerId: owner.id },
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          standId: true,
          stand: { select: { slug: true } },
        },
      },
    },
  });
  if (!access) return { error: "Linked product not found." };

  try {
    await prisma.$transaction((tx) =>
      createContributionLot(tx, {
        productId: access.productId,
        ownerId: owner.id,
        standId: access.member.standId,
        memberId: access.member.id,
        memberName: access.member.name,
        supplierUnitCents: access.supplierUnitCents,
        quantity: amount,
        status: "ACTIVE",
        reason: `Owner added stock for ${access.member.name}`,
      }),
    );
  } catch (error) {
    console.error("Owner add supplier stock failed", error);
    return { error: "Could not add stock." };
  }

  revalidatePath(`/dashboard/suppliers/${access.member.id}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/supply");
  revalidateTag(standCatalogTag(access.member.stand.slug), "max");
  return { ok: true as const };
}
