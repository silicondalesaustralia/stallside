"use client";

import { useState } from "react";
import SectionElement from "@/components/studio/SectionElement";

/** Five tappable stars for choosing a rating. */
export default function ReviewStarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <SectionElement el="stars" as="div" className="studio-stars flex gap-1 text-2xl">
      <div role="radiogroup" aria-label="Your rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className={`leading-none transition ${n <= shown ? "" : "opacity-25"}`}
          >
            ★
          </button>
        ))}
      </div>
    </SectionElement>
  );
}
