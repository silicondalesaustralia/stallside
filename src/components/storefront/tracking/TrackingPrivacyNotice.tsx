import { parseCustomHeadCode } from "@/lib/website/tracking/custom-code";
import { loadLiveStorefrontTracking, tagsRequestContext } from "@/lib/website/tracking/load-live";
import { enabledPrivacyProviders } from "@/lib/website/tracking/privacy-providers";
import CookieSettingsButton from "./CookieSettingsButton";

/**
 * "Analytics and advertising" section for the built-in privacy page, built from the
 * live tags so it stays accurate. Only where the tags actually run.
 */
export default async function TrackingPrivacyNotice({ slug, businessName }: { slug: string; businessName: string }) {
  const ctx = await tagsRequestContext();
  if (!ctx.enabled) return null;
  const tracking = await loadLiveStorefrontTracking(slug);
  if (!tracking?.privacyNotice) return null;
  const providers = enabledPrivacyProviders(tracking);
  const hasCustom = parseCustomHeadCode(tracking.customHead).scripts.length > 0;
  if (providers.length === 0 && !hasCustom) return null;

  return (
    <section className="storefront-page-content storefront-page-content--narrow pb-10" aria-labelledby="privacy-tracking">
      <h2 id="privacy-tracking" className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        Analytics and advertising
      </h2>
      <p className="mt-3 text-[var(--muted)]">
        {businessName} uses the following services to understand how people use this website and to measure and
        improve our advertising. They may set cookies and receive details such as the pages you visit, your device and
        browser, and purchases you make here. For purchases, a scrambled (hashed) copy of your email or phone number may
        be shared to match the purchase to an ad.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--muted)]">
        {providers.map((p) => (
          <li key={p.name}>
            {p.name} ({p.purpose}){" "}
            <a href={p.policyUrl} target="_blank" rel="noopener noreferrer" className="underline">
              privacy policy
            </a>
          </li>
        ))}
        {hasCustom ? <li>Other analytics or marketing tools added by {businessName}</li> : null}
      </ul>
      {tracking.consentMode !== "off" ? (
        <p className="mt-3 text-[var(--muted)]">
          Where the law requires it we ask before using these cookies. <CookieSettingsButton />
        </p>
      ) : null}
    </section>
  );
}
