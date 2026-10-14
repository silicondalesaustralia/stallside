"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import DashFormSection from "@/components/DashFormSection";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { PRODUCT_IMAGE_HINT, PRODUCT_IMAGE_MAX_BYTES } from "@/lib/image-upload-limits";
import { PRODUCT_PHOTOS_MAX, moveGalleryImage } from "@/lib/product-images";
import { addProductPhoto, removeProductPhoto, reorderProductPhotos } from "../product-gallery-actions";
import ProductPhotoTile from "./ProductPhotoTile";

type Result = { ok: true } | { ok: false; error: string };

/** Main photo and extra photos in one place. Changes save straight away. */
export default function ProductPhotosCard({ productId, photos }: { productId: string; photos: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ base: string; order: string[] } | null>(null);
  const dragFrom = useRef<number | null>(null);
  const base = photos.join("\n");
  const order = optimistic && optimistic.base === base ? optimistic.order : photos;
  const free = PRODUCT_PHOTOS_MAX - order.length;

  function run(task: () => Promise<Result>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.ok) {
          setOptimistic(null);
          setMessage(result.error);
        }
      } catch (err) {
        console.error("[product photos]", err);
        setOptimistic(null);
        setMessage(err instanceof Error ? err.message : "Couldn't save. Try again.");
      } finally {
        setProgress(null);
        router.refresh();
      }
    });
  }

  function reorder(next: string[]) {
    setOptimistic({ base, order: next });
    run(() => reorderProductPhotos(productId, next));
  }

  function moveTo(from: number, to: number) {
    if (from === to || to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    reorder(next);
  }

  function upload(files: File[]) {
    const batch = files.slice(0, free);
    run(async () => {
      for (const [i, file] of batch.entries()) {
        setProgress(`Uploading ${i + 1} of ${batch.length}…`);
        const form = new FormData();
        form.set("image", await prepareImageFile(file, PRODUCT_IMAGE_MAX_BYTES));
        const result = await addProductPhoto(productId, form);
        if (!result.ok) return result;
      }
      if (files.length > batch.length) setMessage(`Only ${PRODUCT_PHOTOS_MAX} photos fit, so the first ${batch.length} were added.`);
      return { ok: true };
    });
  }

  return (
    <DashFormSection
      title="Photos"
      hint={`The first photo is the main photo on your shop. Drag to reorder. Up to ${PRODUCT_PHOTOS_MAX} photos - changes save straight away.`}
    >
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {order.map((url, i) => (
          <ProductPhotoTile
            key={url}
            url={url}
            index={i}
            count={order.length}
            busy={pending}
            onMove={(dir) => reorder(moveGalleryImage(order, url, dir))}
            onMakeMain={() => moveTo(i, 0)}
            onRemove={() => {
              setOptimistic({ base, order: order.filter((u) => u !== url) });
              run(() => removeProductPhoto(productId, url));
            }}
            onDragStart={() => {
              dragFrom.current = i;
            }}
            onDrop={() => {
              if (dragFrom.current !== null) moveTo(dragFrom.current, i);
              dragFrom.current = null;
            }}
          />
        ))}
        {free > 0 ? (
          <li className={order.length === 0 ? "col-span-2 row-span-2" : ""}>
            <label
              className={`flex aspect-square size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--line)] bg-white p-2 text-center text-xs font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)] hover:bg-[var(--wash)] ${
                pending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <ImagePlus className="size-6" aria-hidden />
              {progress ?? (order.length === 0 ? "Add photos" : "Add more")}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="sr-only"
                disabled={pending}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length) upload(files);
                }}
              />
            </label>
          </li>
        ) : null}
      </ul>
      <p className="text-xs text-[var(--muted)]">{PRODUCT_IMAGE_HINT}</p>
      {message ? <p role="alert" className="text-sm text-[var(--gone)]">{message}</p> : null}
    </DashFormSection>
  );
}
