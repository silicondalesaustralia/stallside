import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { FooterSettings } from "@/lib/studio/footer-settings";
import StudioFooterSocial from "./StudioFooterSocial";

/** The footer's first column: business name, tagline, region and contact details. */
export default function StudioFooterBrand({
  branding,
  footer,
}: {
  branding: ResolvedStorefrontBranding;
  footer: FooterSettings | null;
}) {
  if (footer?.showBrand === false) return null;
  const name = footer?.brandName?.trim() || branding.businessName;
  const tagline = footer?.showTagline === false ? null : footer?.tagline?.trim() || branding.subheadline;
  const region = footer?.showRegion === false ? null : branding.regionLabel;
  const email = footer?.showEmail === false ? null : branding.contactEmail;
  const phone = footer?.showPhone ? branding.contactPhone : null;

  return (
    <div>
      <p className="studio-footer__brand">{name}</p>
      {tagline ? <p className="mt-2 max-w-xs text-sm leading-relaxed opacity-80">{tagline}</p> : null}
      {region ? <p className="mt-3 text-sm opacity-75">{region}</p> : null}
      {email ? (
        <p className="mt-4">
          <a href={`mailto:${email}`} className="text-sm font-medium hover:underline">
            {email}
          </a>
        </p>
      ) : null}
      {phone ? (
        <p className="mt-2">
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm font-medium hover:underline">
            {phone}
          </a>
        </p>
      ) : null}
      {footer?.showSocial === false ? null : <StudioFooterSocial branding={branding} />}
    </div>
  );
}
