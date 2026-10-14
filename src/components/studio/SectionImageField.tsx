"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { uploadSectionImageFile } from "./uploadSectionImageFile";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Shown when the section has no image of its own (e.g. the site's hero image from Branding). */
  fallbackUrl?: string | null;
  fallbackLabel?: string;
};

const BUTTON =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--field)]";

export default function SectionImageField({ label, value, onChange, fallbackUrl, fallbackLabel }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const shown = value || fallbackUrl || "";

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (file) void upload(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (status === "uploading") return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Drop a JPG, PNG or WebP.");
      return;
    }
    void upload(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!dragging) setDragging(true);
  }

  async function upload(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      onChange(await uploadSectionImageFile(file));
    } catch (err) {
      console.error("[section image]", err);
      setError(err instanceof Error ? err.message : "Couldn't upload that image.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      <div
        className={`relative rounded-lg ${dragging ? "ring-2 ring-[var(--leaf)] ring-offset-2" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={(e) => {
          if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setDragging(false);
        }}
        onDrop={onDrop}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- seller-uploaded URL of unknown host
          <img src={shown} alt="" className="aspect-video w-full rounded-lg border border-[var(--line)] object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-[var(--line)] px-3 text-center text-xs text-[var(--muted)]">
            Drag an image here, or upload one
          </div>
        )}
        {dragging || status === "uploading" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 text-xs font-semibold text-[var(--field)]">
            {status === "uploading" ? "Uploading…" : "Drop to use this image"}
          </div>
        ) : null}
      </div>
      <p className="text-xs text-[var(--muted)]">Tip: drag an image from your computer onto the picture above.</p>
      {!value && fallbackUrl ? (
        <p className="text-xs text-[var(--muted)]">{fallbackLabel ?? "Using your default image."}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className={`${BUTTON} cursor-pointer ${status === "uploading" ? "opacity-60" : ""}`}>
          {status === "uploading" ? "Uploading…" : shown ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            disabled={status === "uploading"}
            onChange={onFile}
          />
        </label>
        {value ? (
          <button type="button" className={BUTTON} onClick={() => onChange("")}>
            {fallbackUrl ? "Use default image" : "Remove image"}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <details className="text-xs">
        <summary className="cursor-pointer text-[var(--muted)]">Paste a web address instead</summary>
        <input
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      </details>
    </div>
  );
}
