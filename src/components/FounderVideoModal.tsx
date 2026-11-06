"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type Props = { open: boolean; onClose: () => void; title: string; embedSrc: string };

/** Large pop-up player; the iframe only mounts while open so closing stops playback. */
export default function FounderVideoModal({ open, onClose, title, embedSrc }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,72rem)] rounded-2xl bg-[var(--field)] p-0 text-[var(--ink-on-dark)] shadow-2xl backdrop:bg-black/70"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <h2 id={titleId} className="truncate text-sm font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="rounded-full p-2 text-[var(--ink-on-dark)]/80 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
      {open ? (
        <iframe
          src={`${embedSrc}&autoplay=1`}
          title={title}
          className="aspect-video w-full bg-black"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : null}
    </dialog>
  );
}
