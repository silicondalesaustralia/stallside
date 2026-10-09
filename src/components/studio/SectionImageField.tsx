"use client";

import { useState, type ChangeEvent } from "react";
import { uploadSectionImage } from "@/app/dashboard/(gated)/website/media/actions";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Shown when the section has no image of its own (e.g. the site's hero image from Branding). */
  fallbackUrl?: string | null;
  fallbackLabel?: string;
};

const BUTTON =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--field)]";

export default function SectionImageField({ label, value, onChange, fallbackUrl, fallbackLabel }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const shown = value || fallbackUrl || "";

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      const prepared = await prepareImageFile(file, LOGO_IMAGE_MAX_BYTES);
      const formData = new FormData();
      formData.set("image", prepared);
      const result = await uploadSectionImage(formData);
      if (result.ok) onChange(result.url);
      else setError(result.error);
    } catch (err) {
      console.error("[section image]", err);
      setError(err instanceof Error ? err.message : "Couldn't upload that image.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element -- seller-uploaded URL of unknown host
        <img src={shown} alt="" className="aspect-video w-full rounded-lg border border-[var(--line)] object-cover" />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-xs text-[var(--muted)]">
          No image yet
        </div>
      )}
      {!value && fallbackUrl ? (
        <p className="text-xs text-[var(--muted)]">{fallbackLabel ?? "Using your default image."}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className={`${BUTTON} cursor-pointer ${status === "uploading" ? "opacity-60" : ""}`}>
          {status === "uploading" ? "Uploading…" : shown ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            disabled={status === "uploading"}
            onChange={onFile}
          />
        </label>
        {value ? (
          <button type="button" className={BUTTON} onClick={() => onChange("")}>
            {fallbackUrl ? "Use default image" : "Remove image"}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <details className="text-xs">
        <summary className="cursor-pointer text-[var(--muted)]">Paste a web address instead</summary>
        <input
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      </details>
    </div>
  );
}
