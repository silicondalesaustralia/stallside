import Image from "next/image";

type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Two equal photos side-by-side for marketing story pages. */
export default function AboutPhotoPair({
  left,
  right,
  caption,
}: {
  left: Photo;
  right: Photo;
  caption?: string;
}) {
  return (
    <figure className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {[left, right].map((photo) => (
          <div
            key={photo.src}
            className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="aspect-[3/4] h-auto w-full object-cover"
              sizes="(max-width: 640px) 50vw, 320px"
            />
          </div>
        ))}
      </div>
      {caption ? (
        <figcaption className="text-center text-sm text-[var(--muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
