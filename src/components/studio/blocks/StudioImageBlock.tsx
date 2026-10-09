import Image from "next/image";

export default function StudioImageBlock({
  imageUrl,
  alt,
  caption,
  layout,
}: {
  imageUrl: string | null;
  alt: string;
  caption: string;
  layout: "full" | "contained" | "wide";
}) {
  const widthClass =
    layout === "full" ? "w-full" : layout === "wide" ? "max-w-6xl" : "max-w-3xl";

  return (
    <section className="studio-section px-4 py-[var(--studio-section-py,3rem)] sm:px-6">
      <figure className={`mx-auto ${widthClass}`}>
        {imageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--studio-card-radius,var(--storefront-radius))]">
            <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 960px" />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-[var(--studio-card-radius)] border border-dashed border-[var(--line)] bg-[var(--wash)] text-sm text-[var(--muted)]">
            Add an image in section settings
          </div>
        )}
        {caption ? (
          <figcaption className="mt-3 text-center text-sm text-[var(--muted)]">{caption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
