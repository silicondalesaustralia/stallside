import type { HeroPreset } from "@/lib/studio/preset-registry";
import Lines from "./HeroThumbLines";

const PHOTO = "bg-[var(--leaf,#5b8a4a)]/40";
const INK = "bg-[var(--field)]";
const SOFT = "bg-[var(--muted)]/50";

/** A tiny sketch of a hero style for the style picker. */
export default function HeroStyleThumb({ style }: { style: HeroPreset }) {
  const box = "relative flex h-10 w-16 shrink-0 overflow-hidden rounded border border-[var(--line)] bg-[var(--wash)]";
  switch (style) {
    case "background":
    case "farm-landscape":
      return (
        <span className={`${box} items-end p-1 ${style === "farm-landscape" ? "bg-[#4f6f3f]/60" : "bg-black/40"}`}>
          <Lines light />
        </span>
      );
    case "split":
      return (
        <span className={`${box} items-center gap-1 pl-1`}>
          <Lines />
          <span className={`ml-auto h-full w-7 ${PHOTO}`} />
        </span>
      );
    case "editorial":
      return (
        <span className={`${box} flex-col items-center gap-0.5 p-1`}>
          <span className={`h-5 w-full rounded-sm ${PHOTO}`} />
          <Lines centre />
        </span>
      );
    case "product-collage":
    case "featured-product":
      return (
        <span className={`${box} items-center gap-1 p-1`}>
          <Lines />
          <span className={`ml-auto grid h-full w-7 gap-0.5 ${style === "product-collage" ? "grid-cols-2" : ""}`}>
            {(style === "product-collage" ? [1, 2, 3, 4] : [1]).map((n) => (
              <span key={n} className={`rounded-sm ${PHOTO}`} />
            ))}
          </span>
        </span>
      );
    case "category-mosaic":
      return (
        <span className={`${box} flex-col gap-0.5 p-1`}>
          <Lines />
          <span className="grid flex-1 grid-cols-4 gap-0.5">
            {[1, 2, 3, 4].map((n) => <span key={n} className={`rounded-sm ${PHOTO}`} />)}
          </span>
        </span>
      );
    case "visit-us":
    case "stand-status":
      return (
        <span className={`${box} items-center gap-1 p-1`}>
          <Lines />
          <span className="ml-auto flex h-6 w-6 flex-col justify-center gap-0.5 rounded-sm border border-[var(--line)] bg-white p-0.5">
            <span className="h-1 w-1 rounded-full bg-green-600" />
            <span className={`h-0.5 w-4 ${SOFT}`} />
          </span>
        </span>
      );
    case "countdown":
      return (
        <span className={`${box} flex-col items-start justify-center gap-0.5 p-1`}>
          <span className="flex gap-0.5">
            {[1, 2, 3].map((n) => <span key={n} className="h-2.5 w-2.5 rounded-sm border border-[var(--line)] bg-white" />)}
          </span>
          <Lines />
        </span>
      );
    case "shop-first":
    case "promo":
    case "current-menu":
      return (
        <span className={`${box} items-center justify-between bg-white px-1`}>
          <Lines />
          {style === "current-menu" ? null : <span className={`h-2 w-4 rounded-full ${INK}`} />}
        </span>
      );
    default:
      return (
        <span className={`${box} items-center justify-center`}>
          <Lines centre />
        </span>
      );
  }
}
