import { hasAnyTracking } from "@/lib/website/tracking/config";
import { parseCustomHeadCode } from "@/lib/website/tracking/custom-code";
import { loadLiveStorefrontTracking, tagsRequestContext } from "@/lib/website/tracking/load-live";
import StorefrontTagsRuntime from "./StorefrontTagsRuntime";

/**
 * The seller's tags & pixels. Only on their subdomain or custom domain, never on
 * vendl.app/shop/… (shares an origin with the dashboard), in previews or the editor.
 */
export default async function StorefrontTags({ slug }: { slug: string }) {
  const ctx = await tagsRequestContext();
  if (!ctx.enabled) return null;
  const tracking = await loadLiveStorefrontTracking(slug);
  if (!tracking || (!hasAnyTracking(tracking) && !ctx.debug)) return null;
  return (
    <StorefrontTagsRuntime
      config={{
        ids: tracking.ids,
        consentMode: tracking.consentMode,
        customScripts: parseCustomHeadCode(tracking.customHead).scripts,
        euVisitor: ctx.euVisitor,
        debug: ctx.debug,
        privacyHref: "/privacy",
      }}
    />
  );
}
