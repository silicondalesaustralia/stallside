import Image from "next/image";
import type { FeaturedStandImage } from "@/lib/featured-stands";

export default function FeaturedStandPhotos({
  images,
  className = "",
}: {
  images: FeaturedStandImage[];
  className?: string;
}) {
  const [main, second] = images;
  if (!main) return null;

  if (!second) {
    return (
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius)] bg-[var(--wash)] shadow-lg ${className}`}
      >
        <Image
          src={main.src}
          alt={main.alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className={`relative pb-16 sm:pb-24 ${className}`}>
      <div className="relative aspect-[4/5] w-[78%] -rotate-2 overflow-hidden rounded-[var(--radius)] bg-[var(--wash)] shadow-xl">
        <Image
          src={main.src}
          alt={main.alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 78vw, 40vw"
        />
      </div>
      <div className="absolute bottom-0 right-0 aspect-[4/5] w-[50%] rotate-3 overflow-hidden rounded-[var(--radius)] border-4 border-white bg-[var(--wash)] shadow-2xl sm:border-[6px]">
        <Image
          src={second.src}
          alt={second.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>
    </div>
  );
}
