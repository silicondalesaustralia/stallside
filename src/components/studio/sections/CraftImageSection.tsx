"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioImageBlock from "@/components/studio/blocks/StudioImageBlock";
import {
  parseGalleryImages,
  parseImageAspect,
  parseImageDisplay,
  type GalleryImage,
  type ImageAspect,
  type ImageDisplay,
} from "@/lib/studio/gallery-images";
import { parseImageStyle } from "@/lib/studio/image-pair";

export type CraftImageProps = {
  imageUrl: string;
  alt: string;
  caption: string;
  layout: "full" | "contained" | "wide";
  display?: ImageDisplay;
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
  aspect?: ImageAspect;
  autoplay?: boolean;
  imageStyle?: string;
  secondImageUrl?: string;
};

export default function CraftImageSection(props: CraftImageProps) {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <StudioImageBlock
          imageUrl={props.imageUrl || null}
          alt={props.alt}
          caption={props.caption}
          layout={props.layout}
          display={parseImageDisplay(props.display)}
          images={parseGalleryImages(props.images)}
          columns={props.columns ?? 3}
          aspect={parseImageAspect(props.aspect)}
          autoplay={props.autoplay === true}
          imageStyle={parseImageStyle(props.imageStyle)}
          secondImageUrl={props.secondImageUrl || null}
          editable
        />
      </CraftSectionChrome>
    </div>
  );
}

CraftImageSection.craft = {
  displayName: "CraftImageSection",
  props: { imageUrl: "", alt: "", caption: "", layout: "contained" },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
