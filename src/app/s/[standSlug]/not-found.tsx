import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { APP_NAME } from "@/lib/constants";

export default function StandNotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <BrandMark className="size-12" />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        Stand not found
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        This QR may be for a stand that was removed, disabled, or printed with the wrong link.
        Ask the owner to open <strong>QR &amp; print</strong> and scan again before reprinting.
      </p>
      <Link href="/" className="mt-8 text-sm font-semibold text-[var(--leaf-dark)] underline">
        {APP_NAME}
      </Link>
    </main>
  );
}
