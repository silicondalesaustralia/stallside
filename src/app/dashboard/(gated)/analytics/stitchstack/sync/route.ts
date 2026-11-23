import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  ensureStitchstackAnalyticsAccount,
  isStitchstackPartnerConfigured,
} from "@/lib/stitchstack";
import { syncStitchstackForOwner } from "@/lib/stitchstack-sync";
import { saveStorefrontStitchstackPixel } from "@/lib/stitchstack-pixel";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 300;

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

/** Manual bidirectional sync: ensure pixel, push orders, pull analytics cache. */
export async function POST(request: Request) {
  const { user, owner, impersonator } = await requireOwner();
  if (impersonator) {
    return redirectTo(request, "/dashboard?stitchstack=impersonating");
  }
  if (!isStitchstackPartnerConfigured()) {
    return redirectTo(request, "/dashboard?stitchstack=error");
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
      return redirectTo(request, "/dashboard?stitchstack=missing_email");
    }

    const businessName = stand?.name ?? owner.businessName ?? "Vendl business";
    const ensured = await ensureStitchstackAnalyticsAccount({
      external_account_id: owner.id,
      external_user_id: user.id,
      email,
      name: user.name ?? null,
      business_name: businessName,
      site_url: siteUrl,
      logo_url: logoUrl,
      role: "owner",
      impersonating: false,
    });
    if (ensured.pixel) {
      try {
        await saveStorefrontStitchstackPixel(owner.id, businessName, ensured.pixel);
      } catch (installError) {
        console.error("[vendl] Stitchstack pixel install during sync failed", installError);
      }
    }

    const result = await syncStitchstackForOwner(owner.id);
    console.info("[vendl] Stitchstack manual sync complete", {
      ownerId: owner.id,
      upserted: result.upserted,
      analytics: result.analytics,
    });

    return redirectTo(request, "/dashboard?stitchstack=synced");
  } catch (error) {
    console.error("[vendl] Stitchstack sync failed", error);
    return redirectTo(request, "/dashboard?stitchstack=error");
  }
}

export async function GET() {
  redirect("/dashboard");
}
