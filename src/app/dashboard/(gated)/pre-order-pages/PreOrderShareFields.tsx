"use client";

import { useState } from "react";
import FilePickButton from "@/components/FilePickButton";
import { APP_DOMAIN } from "@/lib/constants";
import {
  PRODUCT_IMAGE_HINT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/image-upload-limits";

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function PreOrderShareFields({
  title,
  slug,
  description,
  imageUrl,
  onImageBusyChange,
}: {
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  onImageBusyChange?: (busy: boolean) => void;
}) {
  const [previewTitle, setPreviewTitle] = useState(title);
  const [previewDescription, setPreviewDescription] = useState(
    description ?? "",
  );
  const [previewImage, setPreviewImage] = useState(imageUrl);

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4 lg:col-span-2">
      <legend className="px-1 text-sm font-medium">
        Link preview (social media)
      </legend>
      <p className="text-sm text-[var(--muted)]">
        When someone posts your pre-order link on Instagram, Facebook, iMessage,
        or similar, they see this title, description, and photo — not the Vendl
        homepage.
      </p>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="mx-auto w-full max-w-xs overflow-hidden rounded-lg border border-[var(--line)] bg-white md:mx-0">
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt=""
              className="aspect-[1.91/1] w-full bg-[var(--panel)] object-cover"
            />
          ) : (
            <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-[var(--panel)] px-3 text-center text-xs text-[var(--muted)]">
              Add a photo for a larger preview
            </div>
          )}
          <div className="space-y-1 border-t border-[var(--line)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {APP_DOMAIN}
            </p>
            <p className="line-clamp-2 text-sm font-semibold leading-snug">
              {previewTitle.trim() || "Page title"}
            </p>
            <p className="line-clamp-2 text-xs text-[var(--muted)]">
              {previewDescription.trim() ||
                "Optional description appears here when you share the link."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Page title</span>
            <input
              name="title"
              required
              maxLength={120}
              value={previewTitle}
              onChange={(e) => setPreviewTitle(e.target.value)}
              placeholder="Pre-order Monday 17 Mar"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">URL slug (optional)</span>
            <input
              name="slug"
              defaultValue={slug}
              placeholder="auto from title"
              className={`${inputClass} font-receipt`}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Description (optional)</span>
            <input
              name="description"
              value={previewDescription}
              onChange={(e) => setPreviewDescription(e.target.value)}
              maxLength={500}
              placeholder="Fresh eggs for collection Saturday"
              className={inputClass}
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Share photo (optional)</span>
            {previewImage ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="clearImage"
                  className="size-4"
                  onChange={(e) => {
                    if (e.target.checked) setPreviewImage(null);
                    else setPreviewImage(imageUrl);
                  }}
                />
                Remove photo
              </label>
            ) : null}
            <FilePickButton
              name="image"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              label="Choose photo"
              maxBytes={PRODUCT_IMAGE_MAX_BYTES}
              hint={PRODUCT_IMAGE_HINT}
              onBusyChange={onImageBusyChange}
              onFileReady={(file) => {
                setPreviewImage((prev) => {
                  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return file ? URL.createObjectURL(file) : imageUrl;
                });
              }}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
