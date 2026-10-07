"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { dollarsToCents } from "@/lib/money";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { activatePendingLot } from "@/lib/suppliers/contribute";

async function ownedMember(ownerId: string, memberId: string) {
  return prisma.standMember.findFirst({
    where: { id: memberId, ownerId },
    include: { stand: { select: { id: true, slug: true } } },
  });
}

/** Link a stand product so this supplier can add stock into it. */
export async function linkSupplierProduct(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const autoApprove = formData.get("autoApprove") === "1";
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  let owedCents = 0;
  try {
    owedCents = dollarsToCents(String(formData.get("owed") ?? "0"));
  } catch {
    return { error: "Enter what you owe them per unit." };
  }
  if (owedCents < 0) return { error: "Owed amount cannot be negative." };

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ownerId: owner.id,
      standId: member.standId,
      memberId: null,
    },
    select: { id: true },
  });
  if (!product) return { error: "Pick one of your products on this stand." };

  try {
    await prisma.supplierProductAccess.upsert({
      where: {
        memberId_productId: { memberId: member.id, productId: product.id },
      },
      create: {
        memberId: member.id,
        productId: product.id,
        supplierUnitCents: owedCents,
        autoApprove,
      },
      update: { supplierUnitCents: owedCents, autoApprove },
    });
  } catch (error) {
    console.error("Link supplier product failed", error);
    return { error: "Could not link that product." };
  }

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/supply");
  return { ok: true as const };
}

export async function updateLinkedOwed(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const autoApprove = formData.get("autoApprove") === "1";
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  let owedCents = 0;
  try {
    owedCents = dollarsToCents(String(formData.get("owed") ?? "0"));
  } catch {
    return { error: "Enter what you owe them per unit." };
  }

  try {
    await prisma.supplierProductAccess.updateMany({
      where: { memberId: member.id, productId, member: { ownerId: owner.id } },
      data: { supplierUnitCents: owedCents, autoApprove },
    });
  } catch (error) {
    console.error("Update linked owed failed", error);
    return { error: "Could not save." };
  }

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  return { ok: true as const };
}

export async function approveSupplierLot(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const lotId = String(formData.get("lotId") ?? "");
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  try {
    const result = await prisma.$transaction((tx) =>
      activatePendingLot(tx, {
        lotId,
        ownerId: owner.id,
        standId: member.standId,
        memberName: member.name,
      }),
    );
    if (!result) return { error: "Nothing to approve." };
  } catch (error) {
    console.error("Approve supplier lot failed", error);
    return { error: "Could not approve." };
  }

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/dashboard/products");
  revalidateTag(standCatalogTag(member.stand.slug), "max");
  return { ok: true as const };
}

export async function unlinkSupplierProduct(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  await prisma.supplierProductAccess.deleteMany({
    where: { memberId: member.id, productId, member: { ownerId: owner.id } },
  });
  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/supply");
  return { ok: true as const };
}
