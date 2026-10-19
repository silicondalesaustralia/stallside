import Image from "next/image";
import Link from "next/link";
import type { StandPhoto } from "@/components/gallery/StandPhotoTile";
import type { Testimonial } from "@/lib/testimonials";
import SidebarSection from "./SidebarSection";

/** A few approved stand photos and one owner quote, linking to the full gallery. */
export default function SidebarStandsProof({
  photos,
  testimonial,
}: {
  photos: StandPhoto[];
  testimonial?: Testimonial;
}) {
  if (photos.length === 0 && !testimonial) return null;
  return (
    <SidebarSection title="Stands using Vendl">
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="relative aspect-square overflow-hidden rounded-[var(--radius)] bg-[var(--wash)]">
              <Image
                src={photo.imageUrl}
                alt={`${photo.displayName}, ${photo.location}`}
                fill
                sizes="140px"
                className="object-cover"
                unoptimized={photo.imageUrl.startsWith("http")}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {testimonial ? (
        <blockquote className="mt-4 text-sm leading-relaxed text-[var(--ink)]">
          <p>&ldquo;{testimonial.quote[0]}&rdquo;</p>
          <footer className="mt-2 text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--field)]">{testimonial.name}</span>, {testimonial.location}
          </footer>
        </blockquote>
      ) : null}
      <Link
        href="/testimonials-and-gallery"
        className="mt-4 inline-block text-sm font-semibold text-[var(--leaf-dark)] underline-offset-2 hover:underline"
      >
        See more stands &rarr;
      </Link>
    </SidebarSection>
  );
}
