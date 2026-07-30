"use client";

import { useId, useState } from "react";

export default function FilePickButton({
  name,
  accept,
  label = "Choose file",
}: {
  name: string;
  accept?: string;
  label?: string;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFileName(file?.name ?? null);
        }}
      />
      <span className="text-sm text-[var(--muted)]">
        {fileName ?? "No file chosen"}
      </span>
    </div>
  );
}
