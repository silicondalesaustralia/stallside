import { hasAnyTracking } from "@/lib/website/tracking/config";
import { loadLiveStorefrontTracking, tagsRequestContext } from "@/lib/website/tracking/load-live";
import { loadLiveStitchstackPixel } from "@/lib/stitchstack-pixel";
import StorefrontStitchstackPixelRuntime from "./StorefrontStitchstackPixelRuntime";

/**
 * Seller-site Stitchstack analytics pixel. Tenant hosts only (subdomain / custom domain).
 * Not gated on Pro — installs after Stitchstack Analytics SSO.
 */
export default async function StorefrontStitchstackPixel({ slug }: { slug: string }) {
  const ctx = await tagsRequestContext();
  if (!ctx.enabled) return null;

  const [pixel, tracking] = await Promise.all([
    loadLiveStitchstackPixel(slug),
    loadLiveStorefrontTracking(slug),
  ]);
  if (!pixel) return null;

  const tagsActive = Boolean(tracking && (hasAnyTracking(tracking) || ctx.debug));
  const consentMode = tracking?.consentMode ?? "eu";

  return (
    <StorefrontStitchstackPixelRuntime
      scriptSrc={pixel.scriptSrc}
      consentMode={consentMode}
      euVisitor={ctx.euVisitor}
      showBanner={!tagsActive}
      privacyHref="/privacy"
    />
  );
}
