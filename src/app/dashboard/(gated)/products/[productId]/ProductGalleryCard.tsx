"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import DashFormSection from "@/components/DashFormSection";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { PRODUCT_IMAGE_HINT, PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";
import { PRODUCT_GALLERY_MAX } from "@/lib/product-images";
import {
  addProductGalleryImage,
  moveProductGalleryImage,
  removeProductGalleryImage,
} from "../product-gallery-actions";

const SMALL_BTN = "rounded-md border border-[var(--line)] bg-white px-2 py-0.5 text-xs font-semibold disabled:opacity-40";

/** Extra product photos shown after the main photo on the product page. */
export default function ProductGalleryCard({ productId, gallery }: { productId: string; gallery: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const full = gallery.length >= PRODUCT_GALLERY_MAX;

  function run(task: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.ok) setMessage(result.error);
        router.refresh();
      } catch (err) {
        console.error("[product gallery]", err);
        setMessage(err instanceof Error ? err.message : "Couldn't save. Try again.");
      }
    });
  }

  async function upload(file: File) {
    const ready = await prepareImageFile(file, PRODUCT_IMAGE_MAX_BYTES);
    const form = new FormData();
    form.set("image", ready);
    return addProductGalleryImage(productId, form);
  }

  return (
    <DashFormSection
      title="More photos"
      hint={`Up to ${PRODUCT_GALLERY_MAX} extra photos, shown after the main photo on your product page.`}
    >
      {gallery.length ? (
        <ul className="flex flex-wrap gap-3">
          {gallery.map((url, i) => (
            <li key={url} className="flex flex-col items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Extra photo ${i + 1}`} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex gap-1">
                <button type="button" aria-label="Move earlier" disabled={pending || i === 0} className={SMALL_BTN} onClick={() => run(() => moveProductGalleryImage(productId, url, -1))}>
                  ←
                </button>
                <button type="button" aria-label="Move later" disabled={pending || i === gallery.length - 1} className={SMALL_BTN} onClick={() => run(() => moveProductGalleryImage(productId, url, 1))}>
                  →
                </button>
                <button type="button" disabled={pending} className={SMALL_BTN} onClick={() => run(() => removeProductGalleryImage(productId, url))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <label
        className={`inline-flex w-fit cursor-pointer rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] ${
          pending || full ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {pending ? "Saving…" : full ? "Photo limit reached" : "Add photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          disabled={pending || full}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) run(() => upload(file));
          }}
        />
      </label>
      <p className="text-xs text-[var(--muted)]">{PRODUCT_IMAGE_HINT}</p>
      {message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null}
    </DashFormSection>
  );
}
