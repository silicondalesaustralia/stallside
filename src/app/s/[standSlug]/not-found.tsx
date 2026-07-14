import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { APP_NAME } from "@/lib/constants";

export default function StandNotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <BrandMark className="size-14" />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
        Stand not found
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
        This QR may be for a stand that was removed, disabled, or printed with the wrong link.
        Ask the owner to open <strong>QR &amp; print</strong> and scan again before reprinting.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex w-full max-w-xs items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-4 text-lg font-semibold text-white"
      >
        Go to {APP_NAME}
      </Link>
    </main>
  );
}
