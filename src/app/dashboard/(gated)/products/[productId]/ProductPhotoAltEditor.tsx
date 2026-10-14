"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PRODUCT_IMAGE_ALT_MAX } from "@/lib/product-image-alts";
import { saveProductPhotoAlt } from "../product-gallery-actions";

/** Alt text for one photo: describes it for screen readers and search engines. */
export default function ProductPhotoAltEditor({
  productId,
  url,
  initial,
  productName,
  onClose,
}: {
  productId: string;
  url: string;
  initial: string;
  productName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [alt, setAlt] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveProductPhotoAlt(productId, url, alt);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
        onClose();
      } catch (err) {
        console.error("[product photo alt]", err);
        setError("Couldn't save the alt text. Try again.");
      }
    });
  }

  return (
    <div className="flex gap-3 rounded-xl border border-[var(--line)] bg-white p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Alt text</span>
          <textarea
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={PRODUCT_IMAGE_ALT_MAX}
            rows={2}
            autoFocus
            placeholder="e.g. A dozen brown eggs in a cardboard carton"
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
          <span className="text-xs text-[var(--muted)]">
            {alt.length} / {PRODUCT_IMAGE_ALT_MAX} · Describe what&apos;s in the photo. Leave blank to use &ldquo;{productName}&rdquo;.
          </span>
        </label>
        {error ? <p role="alert" className="text-sm text-[var(--gone)]">{error}</p> : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-[var(--leaf)] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save alt text"}
          </button>
          <button type="button" onClick={onClose} disabled={pending} className="px-2 text-sm font-semibold text-[var(--muted)]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
