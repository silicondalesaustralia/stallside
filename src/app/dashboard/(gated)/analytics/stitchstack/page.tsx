import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { isPlatformAdminEmail, requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  STITCHSTACK_APP_URL,
  ensureStitchstackAnalyticsAccount,
  isStitchstackPartnerConfigured,
} from "@/lib/stitchstack";
import { saveStorefrontStitchstackPixel } from "@/lib/stitchstack-pixel";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

/**
 * Vendl → Stitchstack Analytics SSO entry (page so sidebar soft-nav / new-tab both work).
 * Platform admins in login-as may open the seller's Stitchstack workspace.
 */
export default async function StitchstackAnalyticsHandoffPage() {
  const { user, owner, impersonator } = await requireOwner();

  // Only block non-admin impersonation. Super-admins may SSO as the seller workspace.
  if (impersonator && !isPlatformAdminEmail(impersonator.email)) {
    redirect("/dashboard?stitchstack=impersonating");
  }

  if (!isStitchstackPartnerConfigured()) {
    redirect(STITCHSTACK_APP_URL);
  }

  try {
    const { selected } = await resolveSelectedBusiness(owner.id);
    const stand = selected
      ? await prisma.stand.findUnique({
          where: { id: selected.id },
          select: { websiteUrl: true, slug: true, name: true, logoUrl: true },
        })
      : null;

    const siteUrl =
      stand?.websiteUrl?.trim() ||
      (stand?.slug ? storefrontPublicUrl(stand.slug) : null) ||
      null;

    const logoUrl =
      (typeof owner.brandLogoUrl === "string" && owner.brandLogoUrl.startsWith("https://")
        ? owner.brandLogoUrl.trim()
        : null) ||
      (typeof stand?.logoUrl === "string" && stand.logoUrl.startsWith("https://")
        ? stand.logoUrl.trim()
        : null) ||
      null;

    const email = (user.email ?? owner.contactEmail ?? "").trim();
    if (!email) {
      redirect("/dashboard?stitchstack=missing_email");
    }

    if (impersonator) {
      console.info("[vendl] Stitchstack Analytics SSO via admin login-as", {
        adminEmail: impersonator.email,
        ownerId: owner.id,
        userId: user.id,
      });
    }

    const businessName = stand?.name ?? owner.businessName ?? "Vendl business";
    const result = await ensureStitchstackAnalyticsAccount({
      external_account_id: owner.id,
      external_user_id: user.id,
      email,
      name: user.name ?? null,
      business_name: businessName,
      site_url: siteUrl,
      logo_url: logoUrl,
      role: "owner",
      // Always mint as the seller identity; do not flag impersonating to Stitchstack.
      impersonating: false,
    });

    // Pixel-first: install Stitchstack collector on the seller site before SSO redirect.
    if (result.pixel) {
      try {
        await saveStorefrontStitchstackPixel(owner.id, businessName, result.pixel);
      } catch (installError) {
        console.error("[vendl] Stitchstack pixel install failed", installError);
      }
    }

    redirect(result.handoff_url);
  } catch (error: unknown) {
    // next/navigation redirect() throws; rethrow so Next can follow it.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("[vendl] Stitchstack Analytics handoff failed", error);
    redirect("/dashboard?stitchstack=error");
  }
}
