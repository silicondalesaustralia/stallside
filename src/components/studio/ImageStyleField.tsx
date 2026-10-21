"use client";

import SiteChoice from "@/components/studio/SiteChoice";
import SectionImageField from "@/components/studio/SectionImageField";
import { IMAGE_STYLES, IMAGE_STYLE_LABELS, parseImageStyle } from "@/lib/studio/image-pair";

/** "One photo / Two photos" choice, plus the second photo when two are shown. */
export default function ImageStyleField({
  imageStyle,
  secondImageUrl,
  setProp,
}: {
  imageStyle: unknown;
  secondImageUrl: string | undefined;
  setProp: (k: string, v: unknown) => void;
}) {
  const style = parseImageStyle(imageStyle);
  return (
    <>
      <SiteChoice
        label="Image style"
        options={IMAGE_STYLES}
        labels={IMAGE_STYLE_LABELS}
        value={style}
        onChange={(v) => setProp("imageStyle", v)}
      />
      {style === "pair" ? (
        <SectionImageField
          label="Second photo (front)"
          value={secondImageUrl ?? ""}
          onChange={(url) => setProp("secondImageUrl", url)}
        />
      ) : null}
    </>
  );
}
