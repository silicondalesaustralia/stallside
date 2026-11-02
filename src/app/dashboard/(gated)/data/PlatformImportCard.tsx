import Link from "next/link";

export default function PlatformImportCard() {
  return (
    <section className="dash-card flex flex-col gap-3 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">Import from another platform</h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">
          Moving from Shopify, WooCommerce, Squarespace, Wix or Square? Upload their export and
          we&apos;ll match the columns for you. Any other spreadsheet works too.
        </p>
      </div>
      <Link
        href="/dashboard/data/import"
        className="self-start rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-sm font-semibold text-white"
      >
        Import data
      </Link>
    </section>
  );
}
