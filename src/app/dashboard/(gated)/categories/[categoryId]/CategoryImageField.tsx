"use client";

import { useState, type ChangeEvent } from "react";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { LOGO_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";
import { uploadCategoryImage } from "../category-image-actions";

const BUTTON =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--field)]";

/** Thumbnail picker; posts the URL with the category form as `imageUrl`. */
export default function CategoryImageField({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Use a JPG, PNG or WebP.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("image", await prepareImageFile(file, LOGO_IMAGE_MAX_BYTES));
      const result = await uploadCategoryImage(formData);
      if (result.ok) setUrl(result.url);
      else setError(result.error);
    } catch (err) {
      console.error("[category image]", err);
      setError("Couldn't upload that image. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-4">
      <input type="hidden" name="imageUrl" value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- seller-uploaded URL of unknown host
        <img src={url} alt="" className="h-28 w-28 rounded-lg border border-[var(--line)] object-cover" />
      ) : (
        <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-[var(--line)] p-2 text-center text-xs text-[var(--muted)]">
          No image
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label className={`${BUTTON} cursor-pointer ${uploading ? "opacity-60" : ""}`}>
            {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
            <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={onFile} />
          </label>
          {url ? (
            <button type="button" className={BUTTON} onClick={() => setUrl("")}>
              Remove
            </button>
          ) : null}
        </div>
        <p className="max-w-xs text-xs text-[var(--muted)]">
          Shown on your shop&apos;s categories list. Without one, the first product photo is used. Save to keep changes.
        </p>
        {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
      </div>
    </div>
  );
}
