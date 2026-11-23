import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import type { RangeKey } from "@/lib/date-range";
import { RANGE_PRESETS } from "@/lib/date-range";
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

const RANGE_KEYS = new Set<string>(RANGE_PRESETS.map((preset) => preset.key));

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function parseRangeFromForm(form: FormData): {
  range: RangeKey;
  fromParam: string;
  toParam: string;
  dashQuery: string;
} {
  const raw = String(form.get("range") ?? "30d").trim();
  const range = (RANGE_KEYS.has(raw) ? raw : "30d") as RangeKey;
  const fromParam = String(form.get("from") ?? "").trim();
  const toParam = String(form.get("to") ?? "").trim();
  const dashQuery =
    range === "custom" && fromParam && toParam
      ? `range=custom&from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`
      : `range=${encodeURIComponent(range)}`;
  return { range, fromParam, toParam, dashQuery };
}

/** Manual bidirectional sync: ensure pixel, push orders, pull analytics cache. */
export async function POST(request: Request) {
  const { user, owner, impersonator } = await requireOwner();
  // Login-as is admin-only; allow Sync now while impersonating (seller workspace).
  if (!isStitchstackPartnerConfigured()) {
    return redirectTo(request, "/dashboard?stitchstack=error");
  }

  const form = await request.formData().catch(() => new FormData());
  const { range, fromParam, toParam, dashQuery } = parseRangeFromForm(form);

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

    if (impersonator) {
      console.info("[vendl] Stitchstack sync via admin login-as", {
        adminEmail: impersonator.email,
        ownerId: owner.id,
      });
    }

    const result = await syncStitchstackForOwner(owner.id, { range, fromParam, toParam });
    console.info("[vendl] Stitchstack manual sync complete", {
      ownerId: owner.id,
      upserted: result.upserted,
      analytics: result.analytics,
      range,
    });

    return redirectTo(request, `/dashboard?${dashQuery}&stitchstack=synced`);
  } catch (error) {
    console.error("[vendl] Stitchstack sync failed", error);
    return redirectTo(request, `/dashboard?${dashQuery}&stitchstack=error`);
  }
}

export async function GET() {
  redirect("/dashboard");
}
