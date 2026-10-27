"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";

const fieldClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

type Hero = { url: string | null; alt: string | null; width: number | null; height: number | null };

export default function AdminBlogHeroImageField({ hero }: { hero: Hero }) {
  const [url, setUrl] = useState(hero.url ?? "");
  const [width, setWidth] = useState(hero.width?.toString() ?? "");
  const [height, setHeight] = useState(hero.height?.toString() ?? "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setLocalPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    const probe = new window.Image();
    probe.onload = () => {
      setWidth(String(probe.naturalWidth));
      setHeight(String(probe.naturalHeight));
    };
    probe.src = objectUrl;
  }

  const preview = localPreview ?? (url.trim() || null);

  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">Hero image (optional)</h2>
      {preview ? (
        <Image
          src={preview}
          alt=""
          width={640}
          height={360}
          unoptimized
          className="aspect-video w-full rounded-[var(--radius)] object-cover ring-1 ring-[var(--line)]"
        />
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Upload image</span>
        <input
          name="heroImageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFile}
          className="text-sm"
        />
        <span className="text-xs text-[var(--muted)]">
          JPEG, PNG or WebP under 4 MB. Uploads on save and replaces the URL below.
        </span>
      </label>
      <input
        name="heroImageUrl"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Or paste https://… or /news/…"
        className={fieldClass}
      />
      <input name="heroImageAlt" defaultValue={hero.alt ?? ""} placeholder="Alt text" className={fieldClass} />
      <div className="grid grid-cols-2 gap-2">
        <input name="heroImageWidth" type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width" className={fieldClass} />
        <input name="heroImageHeight" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" className={fieldClass} />
      </div>
      {url ? (
        <button
          type="button"
          onClick={() => {
            setUrl("");
            setWidth("");
            setHeight("");
          }}
          className="self-start text-sm font-semibold text-red-700 underline"
        >
          Remove hero image
        </button>
      ) : null}
    </section>
  );
}
