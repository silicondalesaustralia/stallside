import { appBaseUrl } from "@/lib/app-url";
import {
  getStorefrontOrigin,
  type PreferredOriginInput,
} from "@/lib/domains/preferred-origin";

/** Public share link on preferred host (custom → subdomain → app apex). */
export function customOrderFormPublicUrl(
  formId: string,
  preferred: PreferredOriginInput | null,
): string {
  const path = `/f/${encodeURIComponent(formId)}`;
  if (!preferred?.slug) return `${appBaseUrl()}${path}`;
  return `${getStorefrontOrigin(preferred)}${path}`;
}
