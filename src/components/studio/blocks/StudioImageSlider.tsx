"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ASPECT_CLASS, type GalleryImage, type ImageAspect } from "@/lib/studio/gallery-view";

const AUTOPLAY_MS = 5000;
const ARROW =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[var(--field)] shadow-md transition hover:bg-white";

/** Swipeable image slider with arrows, dots and optional autoplay (paused on hover / reduced motion). */
export default function StudioImageSlider({
  images,
  aspect,
  autoplay,
}: {
  images: GalleryImage[];
  aspect: ImageAspect;
  autoplay: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el || count === 0) return;
      const next = ((i % count) + count) % count;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => go(indexRef.current + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, paused, count, go]);

  function onScroll() {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    indexRef.current = i;
    setIndex(i);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") go(indexRef.current + 1);
    else if (e.key === "ArrowLeft") go(indexRef.current - 1);
    else return;
    e.preventDefault();
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Image slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        className="studio-slider__track flex snap-x snap-mandatory overflow-x-auto rounded-[var(--studio-card-radius,var(--storefront-radius))]"
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className={`studio-section-image relative w-full shrink-0 snap-center overflow-hidden ${ASPECT_CLASS[aspect]}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="(max-width:768px) 100vw, 960px" />
          </div>
        ))}
      </div>
      {count > 1 ? (
        <>
          <button type="button" className={`${ARROW} left-3`} onClick={() => go(index - 1)} aria-label="Previous image">
            ‹
          </button>
          <button type="button" className={`${ARROW} right-3`} onClick={() => go(index + 1)} aria-label="Next image">
            ›
          </button>
          <div className="mt-3 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={`dot-${img.url}-${i}`}
                type="button"
                className={`size-2.5 rounded-full transition ${i === index ? "bg-[var(--field)]" : "bg-[var(--line)]"}`}
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
