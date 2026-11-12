import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { domainsInternalLookupSecret } from "@/lib/domains/config";
import { pickWebsiteStand } from "@/lib/storefront/website-stand";

export const runtime = "nodejs";

/**
 * Internal seller-host → farmstand lookup for Edge middleware: whether the website is
 * published, and which stands `/farmstand` can serve (main stand first).
 * Protected by DOMAINS_INTERNAL_LOOKUP_SECRET when set.
 */
export async function GET(request: Request) {
  const secret = domainsInternalLookupSecret();
  if (secret && request.headers.get("x-vendl-internal") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "missing" }, { status: 400 });

  try {
    const storefront = await prisma.storefront.findUnique({
      where: { slug },
      select: { ownerId: true, isPublished: true, draftConfig: true },
    });
    if (!storefront) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const stands = await prisma.stand.findMany({
      where: { ownerId: storefront.ownerId },
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true, isActive: true },
    });
    const main = pickWebsiteStand(stands, storefront.draftConfig);
    const active = stands.filter((s) => s.isActive);
    if (!main?.isActive) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({
      isPublished: storefront.isPublished,
      mainStandSlug: main.slug,
      standSlugs: active.map((s) => s.slug),
    });
  } catch (err) {
    console.error("[farmstand-lookup] failed", slug, err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
