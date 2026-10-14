"use client";

import { useEffect, useRef } from "react";
import ProductImageTrack from "./ProductImageTrack";

/** Full-screen photo viewer: swipe, arrows or keyboard; Escape or the close button exits. */
export default function ProductLightbox({
  images,
  name,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  name: string;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
    if (e.key === "ArrowRight" && index < images.length - 1) onIndexChange(index + 1);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${name} photos`}
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button type="button" onClick={onClose} className="rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25" autoFocus>
            Close ✕
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <ProductImageTrack
            images={images}
            name={name}
            index={index}
            onIndexChange={onIndexChange}
            slideClass="h-[calc(100dvh-4rem)]"
            fit="contain"
            sizes="100vw"
          />
        </div>
      </div>
    </dialog>
  );
}
