import Image from "next/image";
import { ASPECT_CLASS, type GalleryImage, type ImageAspect } from "@/lib/studio/gallery-view";

const COLUMNS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sf-md:grid-cols-3",
  4: "grid-cols-2 sf-md:grid-cols-4",
};

/** A grid of images; two across on phones. */
export default function StudioImageGallery({
  images,
  columns,
  aspect,
}: {
  images: GalleryImage[];
  columns: 2 | 3 | 4;
  aspect: ImageAspect;
}) {
  return (
    <ul className={`grid gap-3 sf-md:gap-4 ${COLUMNS[columns]}`}>
      {images.map((img, i) => (
        <li
          key={`${img.url}-${i}`}
          className={`studio-section-image relative overflow-hidden rounded-[var(--studio-card-radius,var(--storefront-radius))] ${ASPECT_CLASS[aspect]}`}
        >
          <Image
            src={img.url}
            alt={img.alt ?? ""}
            fill
            className="object-cover"
            sizes={`(max-width:768px) 50vw, ${Math.round(100 / columns)}vw`}
          />
        </li>
      ))}
    </ul>
  );
}
