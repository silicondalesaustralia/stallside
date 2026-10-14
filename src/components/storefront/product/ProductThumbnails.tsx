"use client";

import Image from "next/image";

/** Every photo as a tappable thumbnail (all shown; products have at most 8 photos). */
export default function ProductThumbnails({
  images,
  index,
  onSelect,
}: {
  images: string[];
  index: number;
  onSelect: (i: number) => void;
}) {
  if (images.length < 2) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Choose a photo">
      {images.map((src, i) => (
        <li key={src}>
          <button
            type="button"
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => onSelect(i)}
            className={`relative block size-16 overflow-hidden rounded-[calc(var(--studio-card-radius,0.75rem)*0.6)] border-2 ${
              i === index ? "border-[var(--field)]" : "border-transparent opacity-75 hover:opacity-100"
            }`}
          >
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        </li>
      ))}
    </ul>
  );
}
