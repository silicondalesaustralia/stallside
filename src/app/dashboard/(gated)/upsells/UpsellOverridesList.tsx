import Link from "next/link";
import UpsellOverrideTable from "./UpsellOverrideTable";

const empty = "dash-card px-4 py-6 text-center text-sm text-[var(--muted)]";

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
          <div className={empty}>None set.</div>
        ) : (
          <UpsellOverrideTable
            label="Product"
            noun="product"
            rows={products.map((p) => ({ ...p, href: `/dashboard/products/${p.id}` }))}
          />
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
          <div className={empty}>None set.</div>
        ) : (
          <UpsellOverrideTable
            label="Pre-order page"
            noun="pre-order page"
            rows={preOrderPages.map((p) => ({
              id: p.id,
              name: p.title,
              offers: p.addOn,
              href: `/dashboard/pre-order-pages/${p.id}`,
            }))}
          />
        )}
      </div>
    </section>
  );
}
