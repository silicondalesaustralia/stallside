import { prisma } from "@/lib/prisma";
import { isBetaApp, socialConfigured, socialLive } from "@/lib/beta-app";
import { SOCIAL_PREVIEW_EMAILS } from "@/lib/constants";

/** Owner.betaFeatures entry that lets an owner into the beta app (any plan). */
export const BETA_APP_ACCESS = "beta";

export function hasBetaAppAccess(owner: { betaFeatures: string[] } | null): boolean {
  return Boolean(owner?.betaFeatures.includes(BETA_APP_ACCESS));
}

type MaybeEmail = string | null | undefined;

/** Pass the signed-in email and, during admin login-as, the admin's email too. */
export function socialAdminPreview(...emails: MaybeEmail[]): boolean {
  return emails.some((email) => {
    const normalized = email?.trim().toLowerCase();
    return Boolean(normalized && (SOCIAL_PREVIEW_EMAILS as readonly string[]).includes(normalized));
  });
}

/**
 * Social kit access: on the beta app (only beta owners get in) once Social is
 * switched live there; elsewhere when SOCIAL_SECTION_LIVE=1 (full release),
 * otherwise only beta owners. Preview emails get in early once Supabase is set.
 */
export function socialKitEnabledFor(
  owner: { betaFeatures: string[] } | null,
  ...emails: MaybeEmail[]
): boolean {
  if (socialAdminPreview(...emails) && socialConfigured()) return true;
  if (isBetaApp()) return socialLive();
  if (process.env.SOCIAL_SECTION_LIVE === "1") return true;
  return hasBetaAppAccess(owner);
}

export async function socialKitEnabledForOwnerId(
  ownerId: string,
  impersonatorEmail?: MaybeEmail,
): Promise<boolean> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { betaFeatures: true, user: { select: { email: true } } },
  });
  return socialKitEnabledFor(owner, owner?.user.email, impersonatorEmail);
}
