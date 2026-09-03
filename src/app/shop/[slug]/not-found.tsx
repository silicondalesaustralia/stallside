import Link from "next/link";

export default function StorefrontNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        404
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
        Page not found
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        This page doesn&apos;t exist or isn&apos;t available on this shop.
      </p>
      <Link
        href="../"
        className="mt-8 inline-flex rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to shop home
      </Link>
    </main>
  );
}
