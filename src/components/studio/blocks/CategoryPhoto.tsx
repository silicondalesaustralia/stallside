import Image from "next/image";

/** A category's photo filling its box, or its first letter on a soft wash when it has none. */
export default function CategoryPhoto({
  imageUrl,
  title,
  className,
  sizes = "33vw",
}: {
  imageUrl?: string | null;
  title: string;
  className: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[var(--wash)] ${className}`}>
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="sf-photo transition-transform duration-300 group-hover:scale-[1.03]" sizes={sizes} />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-[var(--muted)] opacity-50">
          {title.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
