"use client";

import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import ImageUploadButton from "./ImageUploadButton";
import PhotoList from "./PhotoList";
import ColourInput from "./ColourInput";
import type { BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater };

export default function BrandingStep({ brief, update }: Props) {
  const br = brief.branding;
  const set = <K extends keyof BriefData["branding"]>(key: K, value: BriefData["branding"][K]) =>
    update((prev) => ({ ...prev, branding: { ...prev.branding, [key]: value } }));

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-[var(--field)]">Logo</h3>
        {br.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={br.logoUrl} alt="Your logo" className="h-16 w-auto max-w-48 object-contain" />
        ) : (
          <p className="text-xs text-[var(--muted)]">No logo yet — your business name will be used.</p>
        )}
        <ImageUploadButton label={br.logoUrl ? "Replace logo" : "Upload logo"} onUploaded={(url) => set("logoUrl", url)} />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-[var(--field)]">Colours</h3>
        <label className="flex items-center gap-2 text-sm text-[var(--field)]">
          <input
            type="checkbox"
            checked={br.useExisting}
            onChange={(e) => {
              const on = e.target.checked;
              update((prev) => ({
                ...prev,
                branding: {
                  ...prev.branding,
                  useExisting: on,
                  accentColor: prev.branding.accentColor ?? (on ? "#2f5d3a" : null),
                  secondaryColor: prev.branding.secondaryColor ?? (on ? "#c9a227" : null),
                },
              }));
            }}
          />
          Use my own brand colours
        </label>
        {br.useExisting ? (
          <div className="flex flex-wrap gap-4">
            <ColourInput label="Main colour" value={br.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColourInput label="Second colour" value={br.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)]">Vendl will choose colours that suit your business.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-[var(--field)]">Main photo</h3>
        <p className="text-xs text-[var(--muted)]">Shown at the top of your homepage. A wide photo works best.</p>
        {br.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={br.heroImageUrl} alt="Main website photo" className="h-32 w-auto max-w-full rounded-md object-cover" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <ImageUploadButton label={br.heroImageUrl ? "Replace photo" : "Upload photo"} onUploaded={(url) => set("heroImageUrl", url)} />
          {br.heroImageUrl ? (
            <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => set("heroImageUrl", null)}>
              Remove
            </button>
          ) : null}
        </div>
      </section>

      <PhotoList brief={brief} update={update} />

      <label className="flex items-start gap-2 text-sm text-[var(--field)]">
        <input type="checkbox" className="mt-1" checked={br.decorativeImages} onChange={(e) => set("decorativeImages", e.target.checked)} />
        <span>
          Create up to 2 decorative background images with AI
          <span className="block text-xs text-[var(--muted)]">
            Mood images only — never shown as your real products, farm or people. Replace them any time.
          </span>
        </span>
      </label>
    </div>
  );
}
