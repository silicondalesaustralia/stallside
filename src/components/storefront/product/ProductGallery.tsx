"use client";

import Image from "next/image";
import { useState } from "react";
import { RATIO_CLASS, type ProductImageRatio } from "@/lib/studio/product-detail-settings";
import ProductImageTrack from "./ProductImageTrack";
import ProductThumbnails from "./ProductThumbnails";
import ProductLightbox from "./ProductLightbox";

const FRAME = "overflow-hidden rounded-[var(--studio-card-radius,var(--storefront-radius,var(--radius)))] bg-[var(--wash)]";

/**
 * Product photos. "classic": one photo at a time with thumbnails (swipe on phones).
 * "stacked": every photo in a column on wider screens, classic on phones.
 */
export default function ProductGallery({
  images,
  name,
  ratio,
  enlarge,
  variant,
}: {
  images: string[];
  name: string;
  ratio: ProductImageRatio;
  enlarge: boolean;
  variant: "classic" | "stacked";
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;

  const openAt = enlarge ? (i: number) => setOpen(i) : undefined;
  const sizes = "(max-width: 768px) 100vw, 640px";
  const classic = (
    <>
      <div className={FRAME}>
        <ProductImageTrack
          images={images}
          name={name}
          index={index}
          onIndexChange={setIndex}
          slideClass={RATIO_CLASS[ratio]}
          sizes={sizes}
          priority
          onOpen={openAt}
        />
      </div>
      <ProductThumbnails images={images} index={index} onSelect={setIndex} />
    </>
  );

  return (
    <div>
      {variant === "stacked" && images.length > 1 ? (
        <>
          <div className="sf-md:hidden">{classic}</div>
          <ul className="hidden flex-col gap-4 sf-md:flex">
            {images.map((src, i) => (
              <li key={src} className={`relative ${FRAME} ${RATIO_CLASS[ratio]}`}>
                <Image src={src} alt={i === 0 ? name : `${name}, photo ${i + 1}`} fill sizes={sizes} priority={i === 0} className="object-cover" />
                {openAt ? (
                  <button type="button" className="absolute inset-0 cursor-zoom-in" aria-label={`Enlarge photo ${i + 1}`} onClick={() => openAt(i)} />
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        classic
      )}
      {open !== null ? (
        <ProductLightbox images={images} name={name} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}
