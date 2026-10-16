import Link from "next/link";

/** Products give the AI real context (shop page, product sections, copy); building without them still works. */
export default function NoProductsWarning() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Add some products first for the best result</p>
      <p className="mt-1">
        Your products give the AI builder much more context to create your store — a Shop page, product sections and
        copy about what you actually sell. You can still build now and add a shop later.
      </p>
      <Link
        href="/dashboard/products/new"
        className="mt-2 inline-block rounded-full bg-amber-900 px-4 py-1.5 text-xs font-semibold text-white"
      >
        Add products
      </Link>
    </div>
  );
}
