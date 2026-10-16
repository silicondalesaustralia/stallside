import Link from "next/link";

export default function UpsellOverridesList({
  products,
  preOrderPages,
}: {
  products: { id: string; name: string; offers: string }[];
  preOrderPages: { id: string; title: string; addOn: string }[];
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-[var(--line)] pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Product-specific upsells</h2>
        <p className="text-sm text-[var(--muted)]">
          A product can offer its own extra item instead of the cart upsell above. Set it on the product.
        </p>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">None set.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="font-medium">{p.name}</span>{" "}
                  <span className="text-[var(--muted)]">offers {p.offers}</span>
                </span>
                <Link href={`/dashboard/products/${p.id}`} className="text-[var(--leaf-dark)] underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Pre-order add-ons</h2>
        <p className="text-sm text-[var(--muted)]">
          Each pre-order page can offer one add-on. Set it on the{" "}
          <Link href="/dashboard/pre-order-pages" className="underline">
            pre-order page
          </Link>
          .
        </p>
        {preOrderPages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">None set.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {preOrderPages.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="font-medium">{p.title}</span>{" "}
                  <span className="text-[var(--muted)]">offers {p.addOn}</span>
                </span>
                <Link href={`/dashboard/pre-order-pages/${p.id}`} className="text-[var(--leaf-dark)] underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
