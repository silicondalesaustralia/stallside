import FilePickButton from "@/components/FilePickButton";
import {
  PRODUCT_IMAGE_HINT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/image-upload-limits";

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function NewProductDetailsFields({
  onImageBusyChange,
}: {
  onImageBusyChange: (busy: boolean) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm sm:col-span-2">
          <span className="font-medium">Product name</span>
          <input
            name="name"
            required
            placeholder="Dozen eggs"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">URL slug (optional)</span>
          <input
            name="slug"
            placeholder="auto from name"
            className={`${inputClass} font-receipt`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Product image</span>
          <FilePickButton
            name="image"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            label="Choose image"
            maxBytes={PRODUCT_IMAGE_MAX_BYTES}
            hint={PRODUCT_IMAGE_HINT}
            onBusyChange={onImageBusyChange}
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input name="description" className={inputClass} />
      </label>
    </>
  );
}
