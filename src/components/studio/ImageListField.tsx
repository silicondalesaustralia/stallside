"use client";

import { useState, type DragEvent } from "react";
import { GALLERY_MAX_IMAGES, type GalleryImage } from "@/lib/studio/gallery-images";
import { uploadSectionImageFile } from "./uploadSectionImageFile";

const BUTTON =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--field)]";
const ICON = "rounded border border-[var(--line)] bg-white px-1.5 text-xs disabled:opacity-30";

/** Several images: upload or drop many at once, reorder, add alt text, remove. */
export default function ImageListField({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
}) {
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const room = GALLERY_MAX_IMAGES - images.length;

  async function addFiles(files: File[]) {
    const picked = files.filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (!picked.length) {
      setError(room ? "Those files aren't images. Use JPG, PNG or WebP." : `Up to ${GALLERY_MAX_IMAGES} images.`);
      return;
    }
    setError(files.length > picked.length ? `Added the first ${picked.length} (images only, up to ${GALLERY_MAX_IMAGES}).` : null);
    let next = images;
    for (const [i, file] of picked.entries()) {
      setProgress(`Uploading ${i + 1} of ${picked.length}…`);
      try {
        next = [...next, { url: await uploadSectionImageFile(file) }];
        onChange(next);
      } catch (err) {
        console.error("[image list upload]", err);
        setError(err instanceof Error ? err.message : "Couldn't upload one of the images.");
      }
    }
    setProgress(null);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (!progress) void addFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function move(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-[var(--field)]">Images ({images.length}/{GALLERY_MAX_IMAGES})</p>
      <div
        className={`space-y-2 rounded-lg ${dragging ? "ring-2 ring-[var(--leaf)] ring-offset-2" : ""}`}
        onDragOver={(e) => {
          if (!Array.from(e.dataTransfer.types).includes("Files")) return;
          e.preventDefault();
          e.stopPropagation();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setDragging(false);
        }}
        onDrop={onDrop}
      >
        {images.length === 0 ? (
          <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-[var(--line)] px-3 text-center text-xs text-[var(--muted)]">
            Drag several images here, or upload them
          </div>
        ) : (
          <ul className="space-y-2">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`} className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- seller-uploaded URL of unknown host */}
                <img src={img.url} alt="" className="size-12 shrink-0 rounded object-cover" />
                <input
                  className="min-w-0 flex-1 rounded border border-[var(--line)] px-2 py-1 text-xs"
                  placeholder="Describe the image (alt text)"
                  value={img.alt ?? ""}
                  maxLength={160}
                  onChange={(e) => onChange(images.map((it, j) => (j === i ? { ...it, alt: e.target.value || undefined } : it)))}
                />
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button type="button" className={ICON} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                  <button type="button" className={ICON} disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                </div>
                <button type="button" className="shrink-0 text-xs font-semibold text-red-700" onClick={() => onChange(images.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {dragging ? <p className="text-center text-xs font-semibold text-[var(--field)]">Drop to add</p> : null}
      </div>
      {room > 0 ? (
        <label className={`${BUTTON} inline-block cursor-pointer ${progress ? "opacity-60" : ""}`}>
          {progress ?? "Add images"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            disabled={Boolean(progress)}
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              void addFiles(files);
            }}
          />
        </label>
      ) : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
