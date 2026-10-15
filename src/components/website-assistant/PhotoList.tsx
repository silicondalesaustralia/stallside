"use client";

import { PHOTO_PURPOSES, type BriefData, type PhotoPurpose } from "@/lib/website-ai/assistant/brief/schema";
import ImageUploadButton from "./ImageUploadButton";
import type { BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater };

const PURPOSE_LABELS: Record<PhotoPurpose, string> = {
  logo: "Logo",
  product: "Products",
  team: "Me / the team",
  hero: "Main photo",
  general: "Place / atmosphere",
};

const MAX_PHOTOS = 8;

export default function PhotoList({ brief, update }: Props) {
  const photos = brief.branding.photos;
  const setPhotos = (next: BriefData["branding"]["photos"]) =>
    update((prev) => ({ ...prev, branding: { ...prev.branding, photos: next } }));

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-[var(--field)]">More photos</h3>
      <p className="text-xs text-[var(--muted)]">Your own photos are used on About and story sections.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={`${photo.url}-${i}`} className="flex flex-col gap-1 text-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.alt ?? ""} className="h-24 w-full rounded-md object-cover" />
            <select
              className="rounded border border-[var(--border)] px-1 py-1"
              value={photo.purpose}
              onChange={(e) =>
                setPhotos(photos.map((p, j) => (j === i ? { ...p, purpose: e.target.value as PhotoPurpose } : p)))
              }
            >
              {PHOTO_PURPOSES.filter((p) => p !== "logo").map((p) => (
                <option key={p} value={p}>
                  {PURPOSE_LABELS[p]}
                </option>
              ))}
            </select>
            <button type="button" className="text-left text-[var(--muted)] underline" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <ImageUploadButton
        label="Add a photo"
        disabled={photos.length >= MAX_PHOTOS}
        onUploaded={(url) => setPhotos([...photos, { url, purpose: "general" }])}
      />
    </section>
  );
}
