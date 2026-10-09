import { headers } from "next/headers";
import { storefrontBasePath } from "@/lib/tenancy/public-url";

/** Resolve storefront link base for the current request host. */
export async function currentStorefrontBasePath(slug: string): Promise<string> {
  const h = await headers();
  const host =
    h.get("x-vendl-original-host") ??
    h.get("x-forwarded-host") ??
    h.get("host");
  return storefrontBasePath(slug, host);
}
