import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import SectionCopy from "@/components/studio/SectionCopy";
import CartTotalBar from "@/app/s/[standSlug]/CartTotalBar";
import CartEmptyView from "@/app/s/[standSlug]/CartEmptyView";
import CheckoutCopyPreview from "./CheckoutCopyPreview";

const caption = "mt-8 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]";

/** Builder view of the cart: sample lines plus every state the shopper can see, all editable. */
export default function CartBlockPreview({
  products,
  currency,
  shopHref,
}: {
  products: PublicProductCard[];
  currency: string;
  shopHref: string;
}) {
  const sample = products.slice(0, 2);
  const total = sample.reduce((sum, p) => sum + p.priceCents, 0);
  return (
    <div className="mt-6 flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {sample.length === 0 ? (
          <li className="text-[var(--muted)]">Add products to see sample cart lines here.</li>
        ) : (
          sample.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
            >
              <span className="font-semibold">1 × {p.name}</span>
              <span className="tabular-nums">{formatMoney(p.priceCents, currency)}</span>
            </li>
          ))
        )}
      </ul>
      <CartTotalBar inline totalLabel={formatMoney(total, currency)} disabled={false} onContinue={() => {}} />
      <p className={caption}>When the cart is empty</p>
      <CartEmptyView shopHref={shopHref} />
      <CheckoutCopyPreview />
      <p className={caption}>After paying cash, by bank transfer or with Square</p>
      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-6">
        <SectionCopy k="thanks" fallback="Thank you" as="h2" className="block text-2xl font-bold" />
        <SectionCopy k="paidCash" fallback="Cash payment confirmed. You're all set." as="p" className="mt-2 block" />
        <SectionCopy k="paidCard" fallback="Card payment confirmed. You're all set." as="p" className="mt-2 block" />
        <SectionCopy
          k="paidTransfer"
          fallback="Marked as paid. The owner will see this in their account shortly."
          as="p"
          className="mt-2 block"
        />
        <SectionCopy k="backToShop" fallback="Back to shop" as="p" className="mt-4 block font-semibold underline" />
      </div>
    </div>
  );
}
