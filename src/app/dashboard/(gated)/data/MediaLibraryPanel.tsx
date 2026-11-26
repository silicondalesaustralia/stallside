"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { PRODUCT_IMAGE_HINT, PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";
import {
  linkLibraryPhotoToProduct,
  matchLibraryPhotosToProducts,
  removeLibraryPhoto,
  uploadLibraryPhoto,
} from "./media-library-actions";
import MediaLibraryAssetCard from "./MediaLibraryAssetCard";

export type LibraryAssetRow = {
  id: string;
  url: string;
  fileName: string;
  createdAt: string;
};

export type LibraryProductOption = {
  id: string;
  name: string;
};

/** Bulk photo library: upload, match by filename, or link each photo to a product. */
export default function MediaLibraryPanel({
  assets,
  products,
}: {
  assets: LibraryAssetRow[];
  products: LibraryProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [linkFor, setLinkFor] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function run(task: () => Promise<{ ok: boolean; error?: string; matched?: number; skipped?: number }>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.ok) {
          setMessage(result.error ?? "Something went wrong.");
        } else if (typeof result.matched === "number") {
          setMessage(
            `Linked ${result.matched} photo${result.matched === 1 ? "" : "s"}${
              result.skipped ? ` · ${result.skipped} skipped` : ""
            }.`,
          );
        }
      } catch (err) {
        console.error("[media library]", err);
        setMessage(err instanceof Error ? err.message : "Couldn't save. Try again.");
      } finally {
        setProgress(null);
        router.refresh();
      }
    });
  }

  function upload(files: File[]) {
    run(async () => {
      for (const [i, file] of files.entries()) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const form = new FormData();
        form.set("image", await prepareImageFile(file, PRODUCT_IMAGE_MAX_BYTES));
        const result = await uploadLibraryPhoto(form);
        if (!result.ok) return result;
      }
      return { ok: true };
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="dash-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-[var(--field)]">Upload photos</h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Upload a batch, then link each photo to a product. Name files like the slug, SKU or name
            (e.g. <code className="text-xs">free-range-eggs.jpg</code>) to match automatically.
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{PRODUCT_IMAGE_HINT}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || assets.length === 0}
            onClick={() => run(() => matchLibraryPhotosToProducts())}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--field)] disabled:opacity-50"
          >
            Match filenames to products
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-[var(--ink-on-dark)] disabled:opacity-50"
          >
            <ImagePlus className="size-4" aria-hidden />
            {progress ?? "Upload photos"}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) upload(files);
            }}
          />
        </div>
      </div>

      {message ? (
        <p role="status" className="text-sm text-[var(--field)]">
          {message}
        </p>
      ) : null}

      {assets.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No photos yet. Upload a batch to get started.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((asset) => (
            <MediaLibraryAssetCard
              key={asset.id}
              asset={asset}
              products={products}
              productId={linkFor[asset.id] ?? ""}
              busy={pending}
              onProductChange={(id) => setLinkFor((prev) => ({ ...prev, [asset.id]: id }))}
              onLink={() => {
                const productId = linkFor[asset.id];
                if (productId) run(() => linkLibraryPhotoToProduct(asset.id, productId));
              }}
              onRemove={() => run(() => removeLibraryPhoto(asset.id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
