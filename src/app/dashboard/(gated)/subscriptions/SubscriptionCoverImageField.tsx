"use client";

import { useState } from "react";
import FilePickButton from "@/components/FilePickButton";
import {
  PRODUCT_IMAGE_HINT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/image-upload-limits";

export default function SubscriptionCoverImageField({
  imageUrl,
  onBusyChange,
}: {
  imageUrl: string | null;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [preview, setPreview] = useState(imageUrl);

  return (
    <div className="flex flex-col gap-2 lg:col-span-2">
      <span className="text-sm font-medium">Cover photo (optional)</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-28 w-full max-w-sm rounded-lg object-cover"
        />
      ) : null}
      {preview ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="clearImage"
            className="size-4"
            onChange={(e) => {
              if (e.target.checked) setPreview(null);
              else setPreview(imageUrl);
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
        onBusyChange={onBusyChange}
        onFileReady={(file) => {
          setPreview((prev) => {
            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
            return file ? URL.createObjectURL(file) : imageUrl;
          });
        }}
      />
    </div>
  );
}
