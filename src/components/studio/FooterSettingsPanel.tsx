"use client";

import { useState } from "react";
import { FOOTER_MOBILE_LAYOUTS, type FooterMobileLayout, type FooterSettings } from "@/lib/studio/footer-settings";
import { useStudioEditorChrome } from "./StudioEditorContext";
import SettingsGroup from "./SettingsGroup";
import SiteChoice from "./SiteChoice";
import FooterBrandFields from "./FooterBrandFields";
import FooterColumnsEditor from "./FooterColumnsEditor";
import FooterLookFields from "./FooterLookFields";

const MOBILE_LABELS: Record<FooterMobileLayout, string> = { stacked: "Stacked", accordion: "Dropdowns", columns: "Two columns" };
const MOBILE_HINTS: Record<FooterMobileLayout, string> = {
  stacked: "Every column open, one under another.",
  accordion: "Each column folds away behind its heading; tap + to open it.",
  columns: "Link columns sit two across to save space.",
};

/** Everything in the site footer: business details, link columns, bottom line and colours. */
export default function FooterSettingsPanel() {
  const { footer, setFooter, footerStatus, footerError, setChromeTarget } = useStudioEditorChrome();
  const [open, setOpen] = useState({ brand: true, columns: false, phone: false, look: false });
  const toggle = (group: keyof typeof open, value: boolean) => setOpen((prev) => ({ ...prev, [group]: value }));
  const settings: FooterSettings = footer ?? {};
  const update = (patch: Partial<FooterSettings>) => setFooter?.({ ...settings, ...patch });

  return (
    <aside className="vendl-studio-settings" role="complementary" aria-label="Footer settings">
      <div className="vendl-studio-settings__head flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[var(--field)]">Footer</h2>
        <button type="button" className="text-xs font-semibold text-[var(--muted)]" onClick={() => setChromeTarget?.(null)}>
          Done
        </button>
      </div>
      <div className="vendl-studio-settings__body">
        <SettingsGroup title="Business details" open={open.brand} onToggle={(v) => toggle("brand", v)}>
          <FooterBrandFields footer={settings} update={update} />
        </SettingsGroup>
        <SettingsGroup title="Link columns" open={open.columns} onToggle={(v) => toggle("columns", v)}>
          <FooterColumnsEditor footer={settings} update={update} />
        </SettingsGroup>
        <SettingsGroup title="Phone layout" open={open.phone} onToggle={(v) => toggle("phone", v)}>
          <SiteChoice
            label="Link columns on phones"
            options={FOOTER_MOBILE_LAYOUTS}
            labels={MOBILE_LABELS}
            value={settings.mobileLayout ?? "stacked"}
            onChange={(mobileLayout) => update({ mobileLayout })}
          />
          <p className="text-xs text-[var(--muted)]">{MOBILE_HINTS[settings.mobileLayout ?? "stacked"]} Wider screens always show columns side by side.</p>
        </SettingsGroup>
        <SettingsGroup title="Bottom line & colours" open={open.look} onToggle={(v) => toggle("look", v)}>
          <FooterLookFields footer={settings} update={update} />
        </SettingsGroup>
        {footer ? (
          <button
            type="button"
            className="mt-4 text-xs font-semibold text-[var(--muted)] underline"
            onClick={() => setFooter?.(null)}
          >
            Reset the whole footer to automatic
          </button>
        ) : null}
        {footerStatus === "saving" ? <p className="mt-3 text-xs text-[var(--muted)]">Saving…</p> : null}
        {footerStatus === "saved" ? (
          <p className="mt-3 text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
        ) : null}
        {footerStatus === "error" ? (
          <p className="mt-3 text-xs text-red-700">{footerError ?? "Couldn't save. Try again."}</p>
        ) : null}
      </div>
    </aside>
  );
}
