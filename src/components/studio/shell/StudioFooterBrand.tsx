import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import type { FooterLogoSize, FooterSettings } from "@/lib/studio/footer-view";

const LOGO_HEIGHT: Record<FooterLogoSize, string> = { sm: "h-10", md: "h-14", lg: "h-20" };

/** The footer's first column: business name, tagline, region and contact details. */
export default function StudioFooterBrand({
  branding,
  footer,
  className,
}: {
  branding: ResolvedStorefrontBranding;
  footer: FooterSettings | null;
  className?: string;
}) {
  if (footer?.showBrand === false) return null;
  const name = footer?.brandName?.trim() || branding.businessName;
  const tagline = footer?.showTagline === false ? null : footer?.tagline?.trim() || branding.subheadline;
  const region = footer?.showRegion === false ? null : branding.regionLabel;
  const email = footer?.showEmail === false ? null : branding.contactEmail;
  const phone = footer?.showPhone ? branding.contactPhone : null;
  const logo = footer?.showLogo ? footer.logoUrl || branding.logoUrl : null;

  return (
    <div className={className}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- seller-uploaded logo of any shape
        <img src={logo} alt="" className={`studio-footer__logo mb-3 w-auto max-w-[14rem] object-contain ${LOGO_HEIGHT[footer?.logoSize ?? "md"]}`} />
      ) : null}
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
    </div>
  );
}
