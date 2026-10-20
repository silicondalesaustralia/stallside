import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";
import { APP_NAME } from "@/lib/constants";
import { loadSupplierLedger } from "@/lib/suppliers/ledger";

type Result = { ok: true } | { error: string };

export function ownedSupplier(ownerId: string, memberId: string) {
  return prisma.standMember.findFirst({
    where: { id: memberId, ownerId },
    include: { stand: { select: { id: true, slug: true, name: true, currency: true } } },
  });
}

/** Suppliers of one business, by name. */
export function listOwnerSuppliers(ownerId: string, standId: string) {
  return prisma.standMember.findMany({
    where: { standId, ownerId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, status: true, _count: { select: { products: true } } },
  });
}

/** Supplier with their stock and money ledger and any stock waiting for approval. */
export async function getOwnerSupplier(ownerId: string, memberId: string) {
  const member = await ownedSupplier(ownerId, memberId);
  if (!member) return null;
  const [ledger, pendingLots] = await Promise.all([
    loadSupplierLedger(member.id),
    prisma.stockLot.findMany({
      where: { memberId: member.id, status: "PENDING", quantityRemaining: { gt: 0 } },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { member, ledger, pendingLots };
}

/** Creates or re-sends an invite so the supplier can add products and stock to the business. */
export async function inviteOwnerSupplier(
  owner: { id: string; businessName: string },
  stand: { id: string; name: string },
  rawName: string,
  rawEmail: string,
): Promise<Result> {
  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();
  if (!name || name.length > 80) return { error: "Enter their name." };
  if (!email.includes("@") || email.length > 200) return { error: "Enter their email." };

  const token = randomBytes(24).toString("hex");
  try {
    const existing = await prisma.standMember.findUnique({
      where: { standId_email: { standId: stand.id, email } },
    });
    if (existing?.status === "ACTIVE") return { error: "They already have access to this stand." };
    if (existing) {
      await prisma.standMember.update({
        where: { id: existing.id },
        data: { name, status: "INVITED", inviteToken: token },
      });
    } else {
      await prisma.standMember.create({
        data: { standId: stand.id, ownerId: owner.id, email, name, inviteToken: token },
      });
    }
    const link = `${appBaseUrl()}/supply/invite/${token}`;
    await sendOwnerEmail(
      email,
      `[${APP_NAME}] Add your products to ${stand.name}`,
      `<p>${name}, ${owner.businessName} invited you to add products and update stock for ${stand.name}.</p><p><a href="${link}">Accept invite</a></p>`,
      { kind: "supplier_invite" },
    );
  } catch (error) {
    console.error("Supplier invite failed", error);
    return { error: "Could not send the invite." };
  }
  revalidatePath("/dashboard/suppliers");
  return { ok: true };
}

export async function revokeOwnerSupplier(ownerId: string, memberId: string): Promise<Result> {
  const member = await ownedSupplier(ownerId, memberId);
  if (!member) return { error: "Supplier not found." };
  await prisma.standMember.update({ where: { id: member.id }, data: { status: "REVOKED" } });
  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${member.id}`);
  return { ok: true };
}
