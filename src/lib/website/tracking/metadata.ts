import type { Metadata } from "next";
import { parseCustomHeadCode } from "./custom-code";
import { loadLiveStorefrontTracking, tagsRequestContext } from "./load-live";

/** Site-verification and custom <meta> tags for the seller's own hosts. */
export async function storefrontTrackingMetadata(slug: string): Promise<Metadata> {
  const ctx = await tagsRequestContext();
  if (!ctx.tenantHost) return {};
  const tracking = await loadLiveStorefrontTracking(slug);
  if (!tracking) return {};
  const { ids } = tracking;
  const other: Record<string, string[]> = {};
  const add = (name: string, content: string | undefined) => {
    if (content) (other[name] ??= []).push(content);
  };
  add("msvalidate.01", ids.bingVerification);
  add("facebook-domain-verification", ids.metaDomainVerification);
  add("p:domain_verify", ids.pinterestDomainVerify);
  for (const meta of parseCustomHeadCode(tracking.customHead).metas) add(meta.name, meta.content);
  if (!ids.gscVerification && Object.keys(other).length === 0) return {};
  return {
    verification: {
      ...(ids.gscVerification ? { google: ids.gscVerification } : {}),
      ...(Object.keys(other).length > 0 ? { other } : {}),
    },
  };
}
