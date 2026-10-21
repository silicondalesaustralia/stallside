import Image from "next/image";
import type { GalleryImage, ImageAspect, ImageDisplay } from "@/lib/studio/gallery-view";
import StudioImageGallery from "./StudioImageGallery";
import StudioImageSlider from "./StudioImageSlider";
import ImagePairStack from "@/components/studio/ImagePairStack";
import { showImagePair, type ImageStyle } from "@/lib/studio/image-pair";

const EMPTY =
  "studio-section-image flex aspect-[16/10] items-center justify-center rounded-[var(--studio-card-radius)] border border-dashed border-[var(--line)] bg-[var(--wash)] text-sm text-[var(--muted)]";

export default function StudioImageBlock({
  imageUrl,
  alt,
  caption,
  layout,
  display = "single",
  images = [],
  columns = 3,
  aspect = "landscape",
  autoplay = false,
  editable = false,
  imageStyle = "single",
  secondImageUrl = null,
}: {
  imageUrl: string | null;
  imageStyle?: ImageStyle;
  secondImageUrl?: string | null;
  alt: string;
  caption: string;
  layout: "full" | "contained" | "wide";
  display?: ImageDisplay;
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
  aspect?: ImageAspect;
  autoplay?: boolean;
  editable?: boolean;
}) {
  const widthClass =
    layout === "full" ? "w-full" : layout === "wide" ? "max-w-6xl" : "max-w-3xl";
  const many = display !== "single";
  const empty = many ? images.length === 0 : !imageUrl;
  if (empty && !editable) return null;

  let media;
  if (empty) {
    media = <div className={EMPTY}>{many ? "Add images in section settings" : "Add an image in section settings"}</div>;
  } else if (display === "gallery") {
    media = <StudioImageGallery images={images} columns={columns} aspect={aspect} />;
  } else if (display === "slider") {
    media = <StudioImageSlider images={images} aspect={aspect} autoplay={autoplay} />;
  } else if (showImagePair(imageStyle, secondImageUrl, editable)) {
    media = <ImagePairStack primaryUrl={imageUrl} secondaryUrl={secondImageUrl} />;
  } else {
    media = (
      <div className="studio-section-image relative aspect-[16/10] overflow-hidden rounded-[var(--studio-card-radius,var(--storefront-radius))]">
        <Image src={imageUrl ?? ""} alt={alt} fill className="sf-photo" sizes="(max-width:768px) 100vw, 960px" />
      </div>
    );
  }

  return (
    <section className="studio-section py-[var(--studio-section-py,3rem)] studio-gutter">
      <figure className={`mx-auto ${widthClass}`}>
        {media}
        {caption ? (
          <figcaption className="mt-3 text-center text-sm text-[var(--muted)]">{caption}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
