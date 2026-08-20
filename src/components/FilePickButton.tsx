"use client";

import { useId, useState } from "react";
import { prepareImageFile } from "@/lib/prepare-image-file";

export default function FilePickButton({
  name,
  accept,
  label = "Choose file",
  maxBytes,
  hint,
  onBusyChange,
}: {
  name: string;
  accept?: string;
  label?: string;
  maxBytes?: number;
  hint?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setPreparing(next: boolean) {
    setBusy(next);
    onBusyChange?.(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className={`inline-flex cursor-pointer rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] ${
            busy ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {busy ? "Preparing…" : label}
        </label>
        {/* Keep enabled while preparing — disabled file inputs are omitted from submit. */}
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const input = e.target;
            const file = input.files?.[0];
            setStatus(null);
            if (!file) {
              setFileName(null);
              return;
            }
            if (!maxBytes) {
              setFileName(file.name);
              return;
            }
            if (busy) return;
            setPreparing(true);
            setFileName(file.name);
            setStatus("Preparing photo…");
            void prepareImageFile(file, maxBytes)
              .then((prepared) => {
                const transfer = new DataTransfer();
                transfer.items.add(prepared);
                input.files = transfer.files;
                setFileName(prepared.name);
                setStatus(
                  prepared.size < file.size
                    ? "Photo resized to fit upload limit."
                    : null,
                );
              })
              .catch((error: unknown) => {
                input.value = "";
                setFileName(null);
                setStatus(
                  error instanceof Error
                    ? error.message
                    : "Could not use that image.",
                );
              })
              .finally(() => setPreparing(false));
          }}
        />
        <span className="text-sm text-[var(--muted)]">
          {fileName ?? "No file chosen"}
        </span>
      </div>
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
      {status ? (
        <p
          className={`text-xs ${
            status.includes("resized") || status.includes("Preparing")
              ? "text-[var(--muted)]"
              : "text-[var(--warn)]"
          }`}
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
