import { consentRequired } from "@/lib/website/tracking/consent";
import { loadLiveStorefrontTracking, tagsRequestContext } from "@/lib/website/tracking/load-live";
import { loadLiveStitchstackPixel } from "@/lib/stitchstack-pixel";
import StorefrontStitchstackPixelRuntime from "./StorefrontStitchstackPixelRuntime";

const SCRIPT_ID = "vendl-stitchstack-pixel";

/**
 * Seller-site Stitchstack analytics pixel. Tenant hosts only (subdomain / custom domain).
 * Not gated on Pro — installs after Stitchstack Analytics SSO.
 *
 * When consent is not required (e.g. AU visitor + eu mode), emit a real <script> in HTML
 * so hits fire without waiting on React and show up in view-source.
 */
export default async function StorefrontStitchstackPixel({ slug }: { slug: string }) {
  const ctx = await tagsRequestContext();
  if (!ctx.enabled) return null;

  const [pixel, tracking] = await Promise.all([
    loadLiveStitchstackPixel(slug),
    loadLiveStorefrontTracking(slug),
  ]);
  if (!pixel) return null;

  const consentMode = tracking?.consentMode ?? "eu";
  const needsConsent = consentRequired(consentMode, ctx.euVisitor);

  if (!needsConsent) {
    return <script async id={SCRIPT_ID} src={pixel.scriptSrc} />;
  }

  return (
    <StorefrontStitchstackPixelRuntime
      scriptSrc={pixel.scriptSrc}
      consentMode={consentMode}
      euVisitor={ctx.euVisitor}
      privacyHref="/privacy"
    />
  );
}
