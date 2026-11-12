import { prisma } from "@/lib/prisma";
import type { CartMode } from "@/generated/prisma/client";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { pickWebsiteStand } from "@/lib/storefront/website-stand";
import { standCheckoutUrl } from "@/lib/stand-qr";
import { storefrontSubdomainOrigin, storefrontSubdomainPrimaryEnabled } from "@/lib/tenancy/public-url";
import { farmstandRootPath, withCartModePath } from "./paths";

/**
 * `https://{sub}.vendl.app/farmstand[/{stand}]` for an active stand, or null where seller
 * subdomains aren't served. Creates the owner's unpublished website record when missing,
 * because that record holds the subdomain.
 */
export async function farmstandSubdomainBase(standSlug: string): Promise<string | null> {
  if (!storefrontSubdomainPrimaryEnabled()) return null;
  const slug = standSlug.trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    select: { id: true, ownerId: true, isActive: true, name: true, owner: { select: { businessName: true } } },
  });
  if (!stand?.isActive) return null;
  const storefront =
    (await prisma.storefront.findUnique({
      where: { ownerId: stand.ownerId },
      select: { slug: true, draftConfig: true },
    })) ?? (await ensureStorefront(stand.ownerId, stand.owner.businessName || stand.name));
  const stands = await prisma.stand.findMany({
    where: { ownerId: stand.ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const isMain = pickWebsiteStand(stands, storefront.draftConfig)?.id === stand.id;
  return `${storefrontSubdomainOrigin(storefront.slug)}${farmstandRootPath(slug, isMain)}`;
}

/** The farmstand's home, falling back to `vendl.app/s/{stand}`. Never throws. */
export async function standFarmstandBase(standSlug: string): Promise<string> {
  try {
    const base = await farmstandSubdomainBase(standSlug);
    if (base) return base;
  } catch (err) {
    console.error("[farmstand] subdomain lookup failed; using the vendl.app/s link", standSlug, err);
  }
  return standCheckoutUrl(standSlug);
}

/** Where a stand's QR code and "view shop" links open. */
export async function standFarmstandUrl(
  standSlug: string,
  cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE" = "PRODUCT",
): Promise<string> {
  return withCartModePath(await standFarmstandBase(standSlug), cartMode);
}
