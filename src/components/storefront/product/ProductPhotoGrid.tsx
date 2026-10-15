"use client";

import Image from "next/image";
import { useState } from "react";
import { RATIO_CLASS, type ProductImageRatio } from "@/lib/studio/product-image-ratio";
import { photoAlt } from "@/lib/product-image-alts";
import ProductLightbox from "./ProductLightbox";

/** Extra photos as a grid under the product details (Simple layout). */
export default function ProductPhotoGrid({
  images,
  alts,
  name,
  ratio,
  enlarge,
  offset = 1,
}: {
  images: string[];
  alts?: string[];
  name: string;
  ratio: ProductImageRatio;
  enlarge: boolean;
  /** How many photos were already shown above, so captions and the viewer count from there. */
  offset?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const extras = images.slice(offset);
  if (!extras.length) return null;
  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-3 sf-md:grid-cols-3">
        {extras.map((src, i) => (
          <li key={src} className={`relative overflow-hidden rounded-[var(--studio-card-radius,var(--storefront-radius,var(--radius)))] ${RATIO_CLASS[ratio]}`}>
            <Image src={src} alt={photoAlt(name, alts, i + offset)} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
            {enlarge ? (
              <button type="button" className="absolute inset-0 cursor-zoom-in" aria-label={`Enlarge photo ${i + offset + 1}`} onClick={() => setOpen(i + offset)} />
            ) : null}
          </li>
        ))}
      </ul>
      {open !== null ? (
        <ProductLightbox images={images} alts={alts} name={name} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
