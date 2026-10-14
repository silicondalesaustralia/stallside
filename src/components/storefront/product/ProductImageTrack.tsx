"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { photoAlt } from "@/lib/product-image-alts";

const ARROW =
  "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg font-bold text-[var(--field)] shadow disabled:opacity-0";

/** Swipeable row of photos, one per view, with arrows. `index` is controlled by the parent. */
export default function ProductImageTrack({
  images,
  alts,
  name,
  index,
  onIndexChange,
  slideClass,
  fit = "cover",
  sizes,
  priority,
  onOpen,
}: {
  images: string[];
  alts?: string[];
  name: string;
  index: number;
  onIndexChange: (i: number) => void;
  slideClass: string;
  fit?: "cover" | "contain";
  sizes: string;
  priority?: boolean;
  onOpen?: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      track.scrollLeft = indexRef.current * track.clientWidth;
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    if (Math.round(track.scrollLeft / track.clientWidth) === index) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, [index]);

  function onScroll() {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) onIndexChange(next);
  }

  const many = images.length > 1;
  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
      >
        {images.map((src, i) => (
          <div key={src} className={`relative w-full shrink-0 snap-center ${slideClass}`} aria-label={`Photo ${i + 1} of ${images.length}`}>
            <Image
              src={src}
              alt={photoAlt(name, alts, i)}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              className={fit === "cover" ? "object-cover" : "object-contain"}
            />
            {onOpen ? (
              <button type="button" className="absolute inset-0 cursor-zoom-in" aria-label={`Enlarge photo ${i + 1}`} onClick={() => onOpen(i)} />
            ) : null}
          </div>
        ))}
      </div>
      {many ? (
        <>
          <button type="button" aria-label="Previous photo" disabled={index === 0} onClick={() => onIndexChange(index - 1)} className={`${ARROW} left-2`}>
            ‹
          </button>
          <button type="button" aria-label="Next photo" disabled={index === images.length - 1} onClick={() => onIndexChange(index + 1)} className={`${ARROW} right-2`}>
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
