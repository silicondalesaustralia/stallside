"use client";

import type { CraftImageProps } from "@/components/studio/sections/CraftImageSection";
import {
  parseGalleryImages,
  parseImageAspect,
  parseImageDisplay,
  type ImageAspect,
  type ImageDisplay,
} from "@/lib/studio/gallery-images";
import SectionImageField from "./SectionImageField";
import ImageListField from "./ImageListField";
import ImageStyleField from "./ImageStyleField";
import { parseImageStyle } from "@/lib/studio/image-pair";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const LABEL = "block text-xs font-semibold text-[var(--field)]";
const PILL = "rounded-lg border px-2.5 py-1.5 text-xs font-semibold";
const ON = "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]";
const OFF = "border-[var(--line)] text-[var(--muted)]";
const DISPLAY_LABELS: Record<ImageDisplay, string> = { single: "One image", gallery: "Gallery", slider: "Slider" };
const ASPECT_LABELS: Record<ImageAspect, string> = { square: "Square", landscape: "Landscape", portrait: "Portrait" };

/** Image section: one image, a gallery grid or a slider. */
export default function ImageSectionSettings({
  props,
  setProp,
}: {
  props: CraftImageProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const display = parseImageDisplay(props.display);
  const images = parseGalleryImages(props.images);

  function setDisplay(next: ImageDisplay) {
    if (next !== "single" && images.length === 0 && props.imageUrl) {
      setProp("images", [{ url: props.imageUrl, ...(props.alt ? { alt: props.alt } : {}) }]);
    }
    setProp("display", next);
  }

  return (
    <>
      <div className="space-y-1.5">
        <p className={LABEL}>Show</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(DISPLAY_LABELS) as ImageDisplay[]).map((d) => (
            <button key={d} type="button" className={`${PILL} ${display === d ? ON : OFF}`} onClick={() => setDisplay(d)}>
              {DISPLAY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>
      {display === "single" ? (
        <>
          <SectionImageField
            label={parseImageStyle(props.imageStyle) === "pair" ? "Main photo (back)" : "Image"}
            value={props.imageUrl ?? ""}
            onChange={(url) => setProp("imageUrl", url)}
          />
          <ImageStyleField imageStyle={props.imageStyle} secondImageUrl={props.secondImageUrl} setProp={setProp} />
          <div className="space-y-1.5">
            <label className={LABEL}>Alt text</label>
            <input className={INPUT} value={props.alt} onChange={(e) => setProp("alt", e.target.value)} />
          </div>
        </>
      ) : (
        <>
          <ImageListField images={images} onChange={(next) => setProp("images", next)} />
          {display === "gallery" ? (
            <div className="space-y-1.5">
              <label className={LABEL}>Columns on larger screens</label>
              <select className={INPUT} value={props.columns ?? 3} onChange={(e) => setProp("columns", Number(e.target.value))}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
              <p className="text-xs text-[var(--muted)]">Phones show 2 across.</p>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={props.autoplay === true} onChange={(e) => setProp("autoplay", e.target.checked)} />
              Move to the next image every 5 seconds
            </label>
          )}
          <div className="space-y-1.5">
            <p className={LABEL}>Image shape</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ASPECT_LABELS) as ImageAspect[]).map((a) => (
                <button key={a} type="button" className={`${PILL} ${parseImageAspect(props.aspect) === a ? ON : OFF}`} onClick={() => setProp("aspect", a)}>
                  {ASPECT_LABELS[a]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="space-y-1.5">
        <label className={LABEL}>Caption</label>
        <input className={INPUT} value={props.caption} onChange={(e) => setProp("caption", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL}>Width</label>
        <select className={INPUT} value={props.layout} onChange={(e) => setProp("layout", e.target.value)}>
          <option value="contained">Contained</option>
          <option value="wide">Wide</option>
          <option value="full">Full width</option>
        </select>
      </div>
    </>
  );
}
