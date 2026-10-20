import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { activatePendingLot } from "@/lib/suppliers/contribute";
import { ownedSupplier } from "@/lib/suppliers/members";

type Result = { ok: true } | { error: string };

/** Records money paid to a supplier outside Vendl. */
export async function recordOwnerSupplierPayout(
  ownerId: string,
  memberId: string,
  amount: string,
  rawNote: string,
): Promise<Result> {
  const member = await ownedSupplier(ownerId, memberId);
  if (!member) return { error: "Supplier not found." };
  let amountCents = 0;
  try {
    amountCents = dollarsToCents(amount);
  } catch {
    return { error: "Enter the amount you paid." };
  }
  if (amountCents < 1) return { error: "Enter the amount you paid." };
  const note = rawNote.trim();
  try {
    await prisma.supplierPayout.create({ data: { memberId: member.id, amountCents, note: note || null } });
  } catch (error) {
    console.error("Supplier payout record failed", error);
    return { error: "Could not record the payment." };
  }
  revalidatePath(`/dashboard/suppliers/${member.id}`);
  return { ok: true };
}

/** Moves stock a supplier added into sellable stock. */
export async function approveOwnerSupplierLot(ownerId: string, memberId: string, lotId: string): Promise<Result> {
  const member = await ownedSupplier(ownerId, memberId);
  if (!member) return { error: "Supplier not found." };
  try {
    const result = await prisma.$transaction((tx) =>
      activatePendingLot(tx, { lotId, ownerId, standId: member.standId, memberName: member.name }),
    );
    if (!result) return { error: "Nothing to approve." };
  } catch (error) {
    console.error("Approve supplier lot failed", error);
    return { error: "Could not approve." };
  }
  revalidatePath(`/dashboard/suppliers/${member.id}`);
  revalidatePath("/dashboard/products");
  revalidateTag(standCatalogTag(member.stand.slug), "max");
  return { ok: true };
}
