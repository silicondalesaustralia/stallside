"use client";

import { STAND_SOCIALS } from "@/lib/stand-social";

export default function StandSocialFields({
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  youtubeUrl,
  websiteUrl,
}: {
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
}) {
  const defaults: Record<string, string> = {
    instagramUrl: instagramUrl ?? "",
    facebookUrl: facebookUrl ?? "",
    tiktokUrl: tiktokUrl ?? "",
    youtubeUrl: youtubeUrl ?? "",
    websiteUrl: websiteUrl ?? "",
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Social links</legend>
      <p className="text-sm text-[var(--muted)]">
        Paste profile or website URLs. Leave blank to hide the icon on your
        stall.
      </p>
      {STAND_SOCIALS.map((social) => (
        <label key={social.field} className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <svg
              className="size-4 text-[var(--ink)]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d={social.path} />
            </svg>
            {social.label}
          </span>
          <input
            name={social.field}
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={defaults[social.field] ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
      ))}
    </fieldset>
  );
}
