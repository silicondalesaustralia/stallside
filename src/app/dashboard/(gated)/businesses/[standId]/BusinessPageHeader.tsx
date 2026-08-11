import Link from "next/link";

export default function BusinessPageHeader({
  standId,
  name,
  slug,
  checkoutUrl,
}: {
  standId: string;
  name: string;
  slug: string;
  checkoutUrl: string;
}) {
  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/businesses" className="underline">
          My Businesses
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Checkout:{" "}
            <a
              href={checkoutUrl}
              className="text-[var(--leaf-dark)] underline"
              target="_blank"
            >
              /s/{slug}
            </a>
          </p>
        </div>
        <Link
          href={`/dashboard/businesses/${standId}/qr`}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          QR &amp; print
        </Link>
      </div>
    </div>
  );
}
