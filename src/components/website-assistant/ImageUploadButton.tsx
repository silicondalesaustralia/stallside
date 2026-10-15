"use client";

import { useRef, useState } from "react";
import { uploadSectionImageFile } from "@/components/studio/uploadSectionImageFile";
import { secondaryButton } from "./assistant-copy";

type Props = { label: string; onUploaded: (url: string) => void; disabled?: boolean };

export default function ImageUploadButton({ label, onUploaded, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onUploaded(await uploadSectionImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try another image.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <button type="button" className={secondaryButton} disabled={disabled || busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : label}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </span>
  );
}
