"use client";

import FilePickButton from "@/components/FilePickButton";
import StandSocialFields from "./StandSocialFields";

export type StandBrandingValues = {
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};

/** Branding inputs only — parent form owns submit. */
export default function StandBrandingFields({
  logoUrl,
  accentColor,
  secondaryColor,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  youtubeUrl,
  websiteUrl,
}: StandBrandingValues) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">
        Logo, colours, and social links on your public stall and QR poster.
      </p>
      {logoUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            className="h-14 w-auto max-w-[160px] object-contain"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clearLogo" className="size-4" />
            Remove logo
          </label>
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Logo</span>
        <FilePickButton
          name="logo"
          accept="image/jpeg,image/png,image/webp"
          label="Choose logo"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Primary colour (buttons)</span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            name="accentColor"
            type="color"
            defaultValue={accentColor ?? "#2e7d3f"}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--line)] bg-white"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clearAccent" className="size-4" />
            Stallside default
          </label>
        </div>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Secondary colour (price / stock)</span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            name="secondaryColor"
            type="color"
            defaultValue={secondaryColor ?? "#2e7d3f"}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--line)] bg-white"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clearSecondary" className="size-4" />
            Stallside default
          </label>
        </div>
      </label>
      <StandSocialFields
        instagramUrl={instagramUrl}
        facebookUrl={facebookUrl}
        tiktokUrl={tiktokUrl}
        youtubeUrl={youtubeUrl}
        websiteUrl={websiteUrl}
      />
    </div>
  );
}
