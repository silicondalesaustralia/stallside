import { headers } from "next/headers";

import { tagsRequestContext } from "@/lib/website/tracking/load-live";
import { loadLiveStitchstackPixel } from "@/lib/stitchstack-pixel";

const SCRIPT_ID = "vendl-stitchstack-pixel";

/**
 * Stitchstack analytics pixel for every seller-host page (website, farmstand, custom domain).
 * Always emitted in <head> once Connect has saved the pixel on the storefront.
 */
export default async function TenantStitchstackPixel() {
  const h = await headers();
  const slug = h.get("x-vendl-tenant-slug")?.trim().toLowerCase();
  if (!slug) return null;

  const ctx = await tagsRequestContext();
  if (!ctx.enabled) return null;

  const pixel = await loadLiveStitchstackPixel(slug);
  if (!pixel) return null;

  return <script async id={SCRIPT_ID} src={pixel.scriptSrc} />;
}
