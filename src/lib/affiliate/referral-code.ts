import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import { normalizeReferralCode } from "@/lib/affiliate/constants";

export function referralUrl(code: string): string {
  return `${appBaseUrl()}/r/${code}`;
}

function slugPart(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20)
    .replace(/-+$/g, "");
  return slug || "vendl";
}

function candidateCode(businessName: string): string {
  return `${slugPart(businessName)}-${randomBytes(3).toString("hex")}`;
}

/** Return the owner's referral code, creating one on first use. */
export async function ensureReferralCode(owner: {
  id: string;
  businessName: string;
  referralCode: string | null;
}): Promise<string> {
  if (owner.referralCode) return owner.referralCode;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = candidateCode(owner.businessName);
    const taken = await prisma.owner.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (taken) continue;
    try {
      const updated = await prisma.owner.update({
        where: { id: owner.id },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      return updated.referralCode ?? code;
    } catch (error) {
      console.error("Referral code save failed, retrying", error);
    }
  }
  throw new Error("Could not create a referral code. Try again.");
}

export async function findAffiliateByCode(raw: unknown) {
  const code = normalizeReferralCode(raw);
  if (!code) return null;
  return prisma.owner.findUnique({
    where: { referralCode: code },
    select: { id: true, userId: true, contactEmail: true, deletedAt: true },
  });
}
