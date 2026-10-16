"use client";

import ImageUploadButton from "./ImageUploadButton";

type Props = { logoUrl: string | null; onChange: (url: string | null) => void };

/** Asks for the business logo up front; it's used in the header, browser tab and shared links. */
export default function LogoCard({ logoUrl, onChange }: Props) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-md border p-4 ${
        logoUrl ? "border-[var(--border)]" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div>
        <h3 className="text-sm font-semibold text-[var(--field)]">Your logo</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Shown in your website header, on the browser tab and when your site is shared. A PNG with a transparent
          background works best.
        </p>
      </div>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Your logo" className="h-16 w-auto max-w-48 rounded bg-white object-contain p-1" />
      ) : (
        <p className="text-xs text-amber-900">
          No logo yet — your business name will be shown as text instead. You can add one any time.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <ImageUploadButton label={logoUrl ? "Replace logo" : "Upload your logo"} onUploaded={onChange} />
        {logoUrl ? (
          <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => onChange(null)}>
            Remove
          </button>
        ) : null}
      </div>
    </section>
  );
}
