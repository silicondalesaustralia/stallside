"use client";

import { FOOTER_BRAND_MAX, FOOTER_TAGLINE_MAX, type FooterSettings } from "@/lib/studio/footer-settings";
import { useStudioMetadata } from "./StudioEditorContext";
import { footerSocialLinks } from "./shell/StudioFooterSocial";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

type Toggle = "showTagline" | "showRegion" | "showEmail" | "showSocial";

/** The footer's first column: name, tagline and which contact details show. */
export default function FooterBrandFields({
  footer,
  update,
}: {
  footer: FooterSettings;
  update: (patch: Partial<FooterSettings>) => void;
}) {
  const branding = useStudioMetadata().resolvedBranding;
  const shown = footer.showBrand !== false;
  const toggles: { key: Toggle; label: string; available: boolean }[] = [
    { key: "showTagline", label: "Show tagline", available: true },
    { key: "showRegion", label: `Show location${branding.regionLabel ? ` (${branding.regionLabel})` : ""}`, available: Boolean(branding.regionLabel) },
    { key: "showEmail", label: `Show email (${branding.contactEmail})`, available: true },
    { key: "showSocial", label: `Show social links (${footerSocialLinks(branding).map((l) => l.label).join(", ")})`, available: footerSocialLinks(branding).length > 0 },
  ];

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={shown} onChange={(e) => update({ showBrand: e.target.checked })} />
        Show business details column
      </label>
      {shown ? (
        <>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--field)]">Business name</label>
            <input
              className={INPUT}
              maxLength={FOOTER_BRAND_MAX}
              placeholder={branding.businessName}
              value={footer.brandName ?? ""}
              onChange={(e) => update({ brandName: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--field)]">Tagline</label>
            <textarea
              className={INPUT}
              rows={3}
              maxLength={FOOTER_TAGLINE_MAX}
              placeholder={branding.subheadline ?? "A line about your business"}
              value={footer.tagline ?? ""}
              onChange={(e) => update({ tagline: e.target.value || undefined })}
            />
            <p className="text-xs text-[var(--muted)]">Leave empty to use your site tagline.</p>
          </div>
          {toggles
            .filter((t) => t.available)
            .map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={footer[t.key] !== false} onChange={(e) => update({ [t.key]: e.target.checked })} />
                {t.label}
              </label>
            ))}
          {branding.contactPhone ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={footer.showPhone === true} onChange={(e) => update({ showPhone: e.target.checked })} />
              Show phone ({branding.contactPhone})
            </label>
          ) : null}
          <p className="text-xs text-[var(--muted)]">Change your email, phone, location and social links in Business details.</p>
        </>
      ) : null}
    </div>
  );
}
