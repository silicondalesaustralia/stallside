"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AffiliateCommissionStatus } from "@/generated/prisma/client";
import { findAffiliateByCode } from "@/lib/affiliate/referral-code";

/** Record a manual payout: settles every PENDING commission (one payout per currency). */
export async function markAffiliatePaid(formData: FormData) {
  await requireAdmin();
  const affiliateOwnerId = String(formData.get("affiliateOwnerId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!affiliateOwnerId) throw new Error("Affiliate required");

  await prisma.$transaction(async (tx) => {
    const pending = await tx.affiliateCommission.findMany({
      where: { affiliateOwnerId, status: AffiliateCommissionStatus.PENDING },
      select: { id: true, commissionCents: true, currency: true },
    });
    const byCurrency = new Map<string, { ids: string[]; cents: number }>();
    for (const c of pending) {
      const bucket = byCurrency.get(c.currency) ?? { ids: [], cents: 0 };
      bucket.ids.push(c.id);
      bucket.cents += c.commissionCents;
      byCurrency.set(c.currency, bucket);
    }
    for (const [currency, bucket] of byCurrency) {
      if (bucket.cents <= 0) continue;
      const payout = await tx.affiliatePayout.create({
        data: { affiliateOwnerId, amountCents: bucket.cents, currency, note },
      });
      await tx.affiliateCommission.updateMany({
        where: { id: { in: bucket.ids }, status: AffiliateCommissionStatus.PENDING },
        data: { status: AffiliateCommissionStatus.PAID, payoutId: payout.id },
      });
    }
  });

  revalidatePath("/admin/affiliates");
}

/** Admin override: set (by referral code) or clear who referred an owner. */
export async function setOwnerReferrer(formData: FormData) {
  await requireAdmin();
  const ownerId = String(formData.get("ownerId") ?? "");
  const rawCode = String(formData.get("referralCode") ?? "").trim();
  if (!ownerId) throw new Error("Owner required");

  if (!rawCode) {
    await prisma.owner.update({
      where: { id: ownerId },
      data: { referredByOwnerId: null, referredAt: null },
    });
  } else {
    const affiliate = await findAffiliateByCode(rawCode);
    if (!affiliate) throw new Error(`No affiliate with code ${rawCode}`);
    if (affiliate.id === ownerId) throw new Error("Owners can't refer themselves");
    await prisma.owner.update({
      where: { id: ownerId },
      data: { referredByOwnerId: affiliate.id, referredAt: new Date() },
    });
  }

  revalidatePath(`/admin/owners/${ownerId}`);
  revalidatePath("/admin/affiliates");
}
