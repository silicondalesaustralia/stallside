"use client";

import { FOOTER_LOGO_SIZES, type FooterSettings } from "@/lib/studio/footer-settings";
import { useStudioMetadata } from "./StudioEditorContext";
import SectionImageField from "./SectionImageField";
import SiteChoice from "./SiteChoice";

/** Optional logo at the top of the footer's business column. */
export default function FooterLogoFields({
  footer,
  update,
}: {
  footer: FooterSettings;
  update: (patch: Partial<FooterSettings>) => void;
}) {
  const siteLogo = useStudioMetadata().resolvedBranding.logoUrl;
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={footer.showLogo === true} onChange={(e) => update({ showLogo: e.target.checked })} />
        Show a logo
      </label>
      {footer.showLogo ? (
        <>
          <SectionImageField
            label="Footer logo"
            value={footer.logoUrl ?? ""}
            onChange={(url) => update({ logoUrl: url || undefined })}
            fallbackUrl={siteLogo}
            fallbackLabel="Using your site logo. Upload a different one here, e.g. a light version for a dark footer."
          />
          <SiteChoice
            label="Logo size"
            options={FOOTER_LOGO_SIZES}
            labels={{ sm: "Small", md: "Medium", lg: "Large" }}
            value={footer.logoSize ?? "md"}
            onChange={(v) => update({ logoSize: v })}
          />
        </>
      ) : null}
    </div>
  );
}
