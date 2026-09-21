"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { dollarsToCents } from "@/lib/money";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

async function ownedMember(ownerId: string, memberId: string) {
  return prisma.standMember.findFirst({
    where: { id: memberId, ownerId },
    include: { stand: { select: { slug: true } } },
  });
}

export async function saveSupplierTerms(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const publish = formData.get("publish") === "1";
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  const product = await prisma.product.findFirst({
    where: { id: productId, memberId: member.id, ownerId: owner.id },
    select: { id: true },
  });
  if (!product) return { error: "Product not found." };

  let priceCents = 0;
  let owedCents = 0;
  try {
    priceCents = dollarsToCents(String(formData.get("price") ?? ""));
    owedCents = dollarsToCents(String(formData.get("owed") ?? "0"));
  } catch {
    return { error: "Enter a valid price and amount owed." };
  }
  if (priceCents < 1) return { error: "Set a retail price above zero." };

  try {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        priceCents,
        supplierUnitCents: owedCents,
        ...(publish
          ? { isActive: true, isHidden: false, isArchived: false }
          : {}),
      },
    });
  } catch (error) {
    console.error("Supplier terms save failed", error);
    return { error: "Could not save." };
  }

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/dashboard/products");
  revalidateTag(standCatalogTag(member.stand.slug), "max");
  return { ok: true as const };
}

export async function markSupplierPaid(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const member = await ownedMember(owner.id, memberId);
  if (!member) return { error: "Supplier not found." };

  let amountCents = 0;
  try {
    amountCents = dollarsToCents(String(formData.get("amount") ?? ""));
  } catch {
    return { error: "Enter the amount you paid." };
  }
  if (amountCents < 1) return { error: "Enter the amount you paid." };

  try {
    await prisma.supplierPayout.create({
      data: {
        memberId: member.id,
        amountCents,
        note: note || null,
      },
    });
  } catch (error) {
    console.error("Supplier payout record failed", error);
    return { error: "Could not record the payment." };
  }

  revalidatePath(`/dashboard/suppliers/${member.id}`);
  return { ok: true as const };
}

export async function revokeSupplier(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const memberId = String(formData.get("memberId") ?? "");
  const member = await ownedMember(owner.id, memberId);
  if (!member) redirect("/dashboard/suppliers");

  await prisma.standMember.update({
    where: { id: member.id },
    data: { status: "REVOKED" },
  });
  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${member.id}`);
  redirect("/dashboard/suppliers");
}
