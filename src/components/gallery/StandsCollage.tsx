import StandPhotoTile, { type StandPhoto } from "@/components/gallery/StandPhotoTile";
import TestimonialTile from "@/components/gallery/TestimonialTile";
import type { Testimonial } from "@/lib/testimonials";

type CollageItem =
  | { kind: "photo"; photo: StandPhoto; index: number }
  | { kind: "quote"; item: Testimonial; index: number };

const PHOTOS_PER_QUOTE = 2;

function interleave(photos: StandPhoto[], quotes: Testimonial[]): CollageItem[] {
  const items: CollageItem[] = [];
  let q = 0;
  photos.forEach((photo, i) => {
    if (i % PHOTOS_PER_QUOTE === 1 && q < quotes.length) {
      items.push({ kind: "quote", item: quotes[q], index: q });
      q += 1;
    }
    items.push({ kind: "photo", photo, index: i });
  });
  for (; q < quotes.length; q += 1) {
    items.push({ kind: "quote", item: quotes[q], index: q });
  }
  return items;
}

export default function StandsCollage({
  photos,
  quotes,
}: {
  photos: StandPhoto[];
  quotes: Testimonial[];
}) {
  const items = interleave(photos, quotes);
  if (items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Gallery coming soon.</p>;
  }

  return (
    <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {items.map((entry) => (
        <li
          key={entry.kind === "photo" ? `p-${entry.photo.id}` : `q-${entry.item.id}`}
          className="mb-5 break-inside-avoid"
        >
          {entry.kind === "photo" ? (
            <StandPhotoTile photo={entry.photo} index={entry.index} />
          ) : (
            <TestimonialTile item={entry.item} index={entry.index} />
          )}
        </li>
      ))}
    </ul>
  );
}
