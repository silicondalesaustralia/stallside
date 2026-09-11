"use client";

import { useRef, useState } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveStorefrontBranding } from "../actions";
import { sampleLogoColours } from "@/lib/website/sample-logo-colours";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

function ImageField({
  title,
  hint,
  name,
  removeName,
  url,
  emptyLabel,
  previewClass,
}: {
  title: string;
  hint: string;
  name: string;
  removeName: string;
  url: string | null;
  emptyLabel: string;
  previewClass: string;
}) {
  return (
    <div className="space-y-2 text-sm">
      <span className="font-medium text-[var(--field)]">{title}</span>
      <p className="text-xs text-[var(--muted)]">{hint}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={previewClass} />
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-6 text-center text-xs text-[var(--muted)]">
          {emptyLabel}
        </p>
      )}
      <input name={name} type="file" accept="image/*" className={inputClass} />
      {url ? (
        <label className="flex items-center gap-2">
          <input type="checkbox" name={removeName} />
          Remove current {title.toLowerCase()}
        </label>
      ) : null}
    </div>
  );
}

export default function BrandingForm({
  logoUrl,
  faviconUrl,
  heroImageUrl,
  accentColor,
  secondaryColor,
}: {
  logoUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string;
  secondaryColor: string;
}) {
  const accentRef = useRef<HTMLInputElement>(null);
  const secondaryRef = useRef<HTMLInputElement>(null);
  const [sampleMsg, setSampleMsg] = useState<string | null>(null);
  const [sampling, setSampling] = useState(false);

  async function onSampleLogo() {
    if (!logoUrl) return;
    setSampling(true);
    setSampleMsg(null);
    try {
      const sampled = await sampleLogoColours(logoUrl);
      if (!sampled) {
        setSampleMsg("Couldn’t read colours from that logo. Pick them manually.");
        return;
      }
      if (accentRef.current) accentRef.current.value = sampled.accent;
      if (secondaryRef.current) secondaryRef.current.value = sampled.secondary;
      setSampleMsg("Colours sampled from your logo — save to keep them.");
    } finally {
      setSampling(false);
    }
  }

  return (
    <form
      action={saveStorefrontBranding}
      encType="multipart/form-data"
      className="space-y-6 rounded-2xl border border-[var(--line)] bg-white p-5"
    >
      <ImageField
        title="Logo"
        hint="Shown in your site header, stall, and QR materials."
        name="logo"
        removeName="removeLogo"
        url={logoUrl}
        emptyLabel="No logo yet — or use a text wordmark from AI later"
        previewClass="mt-2 max-h-24 max-w-xs object-contain"
      />

      <div className="space-y-3 text-sm">
        <span className="font-medium text-[var(--field)]">Brand colours</span>
        <p className="text-xs text-[var(--muted)]">
          Used on your live site now. AI also uses these (and your logo) when
          recommending looks.
        </p>
        <div className="flex flex-wrap gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--muted)]">Primary</span>
            <input
              ref={accentRef}
              name="accentColor"
              type="color"
              defaultValue={accentColor}
              className="h-10 w-14 cursor-pointer rounded border border-[var(--line)] bg-white"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--muted)]">Secondary</span>
            <input
              ref={secondaryRef}
              name="secondaryColor"
              type="color"
              defaultValue={secondaryColor}
              className="h-10 w-14 cursor-pointer rounded border border-[var(--line)] bg-white"
            />
          </label>
        </div>
        {logoUrl ? (
          <button
            type="button"
            onClick={onSampleLogo}
            disabled={sampling}
            className="text-sm font-medium underline text-[var(--field)] disabled:opacity-60"
          >
            {sampling ? "Sampling logo…" : "Suggest colours from logo"}
          </button>
        ) : null}
        {sampleMsg ? <p className="text-xs text-[var(--muted)]">{sampleMsg}</p> : null}
      </div>

      <ImageField
        title="Favicon"
        hint="Small icon in the browser tab. Square PNG works best."
        name="favicon"
        removeName="removeFavicon"
        url={faviconUrl}
        emptyLabel="No favicon yet"
        previewClass="mt-2 h-12 w-12 rounded object-contain"
      />
      <ImageField
        title="Hero image"
        hint="Homepage hero. AI can also generate decorative placeholders next."
        name="heroImage"
        removeName="removeHero"
        url={heroImageUrl}
        emptyLabel="No hero image yet"
        previewClass="mt-2 max-h-48 w-full rounded-xl object-cover"
      />
      <button type="submit" className={dashCtaClass}>
        Save branding
      </button>
    </form>
  );
}
