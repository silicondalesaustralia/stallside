import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Tailwind size classes for the square frame. */
  className: string;
  sizes: string;
};

/** Square photo on the left of a Next drop card. */
export default function NextDropThumb({ src, alt, className, sizes }: Props) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[var(--studio-card-radius)] bg-[var(--wash)] ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
    </div>
  );
}
