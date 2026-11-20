import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  STITCHSTACK_APP_URL,
  ensureStitchstackAnalyticsAccount,
  isStitchstackPartnerConfigured,
} from "@/lib/stitchstack";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export const runtime = "nodejs";

function appOrigin(): string {
  return (
    process.env.AUTH_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/**
 * Vendl → Stitchstack Analytics SSO entry.
 * Requires a Vendl owner session; redirects to a one-time Stitchstack handoff URL.
 */
export async function GET() {
  const { user, owner, impersonator } = await requireOwner();
  const origin = appOrigin();

  if (impersonator) {
    return NextResponse.redirect(`${origin}/dashboard?stitchstack=impersonating`);
  }

  if (!isStitchstackPartnerConfigured()) {
    // Until the partner key is live, keep the previous external-tab behaviour.
    return NextResponse.redirect(STITCHSTACK_APP_URL);
  }

  try {
    const { selected } = await resolveSelectedBusiness(owner.id);
    const stand = selected
      ? await prisma.stand.findUnique({
          where: { id: selected.id },
          select: { websiteUrl: true, slug: true, name: true },
        })
      : null;

    const siteUrl =
      stand?.websiteUrl?.trim() ||
      (stand?.slug ? storefrontPublicUrl(stand.slug) : null) ||
      null;

    const result = await ensureStitchstackAnalyticsAccount({
      external_account_id: owner.id,
      external_user_id: user.id,
      email: user.email ?? owner.contactEmail ?? "",
      name: user.name ?? null,
      business_name: stand?.name ?? owner.businessName ?? "Vendl business",
      site_url: siteUrl,
      role: "owner",
      impersonating: false,
    });

    return NextResponse.redirect(result.handoff_url);
  } catch (error: unknown) {
    console.error("[vendl] Stitchstack Analytics handoff failed", error);
    return NextResponse.redirect(`${origin}/dashboard?stitchstack=error`);
  }
}
