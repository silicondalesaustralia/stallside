import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import StandCartLink from "./StandCartLink";
import StandStoreLinks from "./StandStoreLinks";
import StandStoreMenu from "./StandStoreMenu";

export default function StandStoreHeader({
  standName,
  standSlug,
  logoUrl,
  backHref,
  backLabel,
}: {
  standName: string;
  standSlug: string;
  logoUrl: string | null;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="relative flex flex-col gap-3">
      <div className="absolute left-0 top-0 z-10 sm:hidden">
        <StandStoreMenu standSlug={standSlug} />
      </div>
      <div className="absolute right-0 top-0 z-10">
        <StandCartLink standSlug={standSlug} />
      </div>
      <div className="flex flex-col items-center px-14 text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-16 w-auto max-h-20 max-w-[min(100%,220px)] object-contain sm:h-20 sm:max-h-24"
          />
        ) : (
          <BrandMark className="size-14 sm:size-16" />
        )}
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          {standName}
        </h1>
        <div className="mt-3 hidden sm:block">
          <StandStoreLinks
            standSlug={standSlug}
            className="flex justify-center gap-4 text-sm font-medium"
          />
        </div>
      </div>
      {backHref ? (
        <p className="text-center text-sm">
          <Link href={backHref} className="font-medium text-[var(--leaf-dark)] underline">
            {backLabel ?? "← Back"}
          </Link>
        </p>
      ) : null}
    </header>
  );
}
