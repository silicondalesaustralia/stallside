import Image from "next/image";

const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[4/3]"] as const;

export type StandPhoto = {
  id: string;
  imageUrl: string;
  displayName: string;
  location: string;
  caption: string | null;
};

export default function StandPhotoTile({
  photo,
  index,
}: {
  photo: StandPhoto;
  index: number;
}) {
  const remote = photo.imageUrl.startsWith("http");
  const aspect = ASPECTS[index % ASPECTS.length];

  return (
    <figure className="group relative overflow-hidden rounded-[var(--radius)] bg-[var(--panel)] shadow-sm ring-1 ring-[var(--line)]">
      <div className={`relative ${aspect}`}>
        <Image
          src={photo.imageUrl}
          alt={`${photo.displayName}, ${photo.location}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={remote}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight">
          {photo.displayName}
        </p>
        <p className="text-sm text-white/80">{photo.location}</p>
        {photo.caption ? (
          <p className="mt-1.5 text-sm text-white/90">{photo.caption}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
