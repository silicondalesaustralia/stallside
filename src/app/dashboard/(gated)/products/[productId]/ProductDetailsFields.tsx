import FilePickButton from "@/components/FilePickButton";

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function ProductDetailsFields({
  name,
  slug,
  freshnessNote,
  description,
  imageUrl,
}: {
  name: string;
  slug: string;
  freshnessNote: string | null;
  description: string | null;
  imageUrl: string | null;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm sm:col-span-2">
          <span className="font-medium">Product name</span>
          <input name="name" required defaultValue={name} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">URL slug</span>
          <input
            name="slug"
            required
            defaultValue={slug}
            className={`${inputClass} font-receipt`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Freshness note</span>
          <input
            name="freshnessNote"
            defaultValue={freshnessNote ?? ""}
            maxLength={80}
            placeholder="Laid this morning"
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          defaultValue={description ?? ""}
          className={inputClass}
        />
      </label>
      <div className="flex flex-wrap items-end gap-4">
        {imageUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="clearImage" className="size-4" />
              Remove
            </label>
          </div>
        ) : null}
        <label className="flex min-w-[12rem] flex-1 flex-col gap-2 text-sm">
          <span className="font-medium">Product image</span>
          <FilePickButton
            name="image"
            accept="image/jpeg,image/png,image/webp"
            label="Choose image"
          />
        </label>
      </div>
    </>
  );
}
