"use client";

import { ImagePlus } from "lucide-react";

/** The dashed "Add photos" tile at the end of the product photo grid. */
export default function ProductPhotoAddTile({
  empty,
  busy,
  label,
  onFiles,
}: {
  empty: boolean;
  busy: boolean;
  label: string | null;
  onFiles: (files: File[]) => void;
}) {
  return (
    <li className={empty ? "col-span-2 row-span-2" : ""}>
      <label
        className={`flex aspect-square size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--line)] bg-white p-2 text-center text-xs font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)] hover:bg-[var(--wash)] ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <ImagePlus className="size-6" aria-hidden />
        {label ?? (empty ? "Add photos" : "Add more")}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) onFiles(files);
          }}
        />
      </label>
    </li>
  );
}
