import Image from "next/image";

const PLACEHOLDER =
  "flex h-full w-full items-center justify-center border border-dashed border-[var(--line)] bg-[var(--wash)] p-3 text-center text-xs text-[var(--muted)]";

function Photo({ url, label, sizes, priority }: { url: string | null; label: string; sizes: string; priority?: boolean }) {
  return url ? (
    <Image src={url} alt="" fill className="object-cover" sizes={sizes} priority={priority} />
  ) : (
    <div className={PLACEHOLDER}>{label}</div>
  );
}

/** Two layered photos: a large tilted back photo and a smaller framed one overlapping its corner. */
export default function ImagePairStack({
  primaryUrl,
  secondaryUrl,
  priority = false,
  className = "",
}: {
  primaryUrl: string | null;
  secondaryUrl: string | null;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`studio-image-pair relative mx-auto aspect-[1/1.05] w-full max-w-[34rem] ${className}`}>
      <div className="absolute left-0 top-0 aspect-[4/5] w-[76%] -rotate-2 overflow-hidden rounded-[calc(var(--studio-card-radius,1rem)+0.5rem)] shadow-lg">
        <Photo url={primaryUrl} label="Add the main photo" sizes="(max-width:1024px) 76vw, 400px" priority={priority} />
      </div>
      <div className="absolute bottom-0 right-0 aspect-[4/5] w-[50%] rotate-2 overflow-hidden rounded-[calc(var(--studio-card-radius,1rem)+0.5rem)] border-4 border-white bg-white shadow-xl">
        <Photo url={secondaryUrl} label="Add the second photo" sizes="(max-width:1024px) 50vw, 270px" />
      </div>
    </div>
  );
}
