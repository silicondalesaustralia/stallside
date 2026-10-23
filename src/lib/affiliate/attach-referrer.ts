import { prisma } from "@/lib/prisma";
import { findAffiliateByCode } from "@/lib/affiliate/referral-code";

/** First-touch: link a brand-new owner to the affiliate whose code they signed up with. */
export async function attachReferrerAtSignup(input: {
  ownerId: string;
  userId: string;
  email: string;
  referralCode: string | null | undefined;
}): Promise<void> {
  if (!input.referralCode) return;
  try {
    const affiliate = await findAffiliateByCode(input.referralCode);
    if (!affiliate || affiliate.deletedAt) return;
    if (
      affiliate.id === input.ownerId ||
      affiliate.userId === input.userId ||
      affiliate.contactEmail.trim().toLowerCase() === input.email
    ) {
      return;
    }
    await prisma.owner.updateMany({
      where: { id: input.ownerId, referredByOwnerId: null },
      data: { referredByOwnerId: affiliate.id, referredAt: new Date() },
    });
  } catch (error) {
    console.error("Attach referrer at signup failed", {
      ownerId: input.ownerId,
      error,
    });
  }
}
