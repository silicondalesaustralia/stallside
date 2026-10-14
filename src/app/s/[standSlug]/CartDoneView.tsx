import Link from "next/link";
import RestockOptIn from "@/components/RestockOptIn";
import SectionCopy from "@/components/studio/SectionCopy";
import TapAndGoInterestCta from "./TapAndGoInterestCta";

export type CartPaidVia = "cash" | "local_transfer" | "square";

const PAID_COPY: Record<CartPaidVia, { k: string; fallback: string }> = {
  cash: { k: "paidCash", fallback: "Cash payment confirmed. You're all set." },
  square: { k: "paidCard", fallback: "Card payment confirmed. You're all set." },
  local_transfer: {
    k: "paidTransfer",
    fallback: "Marked as paid. The owner will see this in their account shortly.",
  },
};

/** Thank-you view shown in the cart after cash, bank transfer or Square payments. */
export default function CartDoneView({
  paidVia,
  standSlug,
  shopHref,
  restockStandId,
  showTapAndGo,
}: {
  paidVia: CartPaidVia;
  standSlug: string;
  shopHref: string;
  restockStandId?: string | null;
  showTapAndGo: boolean;
}) {
  const copy = PAID_COPY[paidVia];
  return (
    <div className="mt-10 flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <SectionCopy
          k="thanks"
          fallback="Thank you"
          as="h2"
          className="block font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight"
        />
        <SectionCopy k={copy.k} fallback={copy.fallback} as="p" className="mt-3 block text-xl text-[var(--muted)]" />
        {restockStandId ? <RestockOptIn standId={restockStandId} inputId="restock-email-cash" /> : null}
      </div>
      {showTapAndGo ? <TapAndGoInterestCta standSlug={standSlug} /> : null}
      <Link href={shopHref} className="text-center font-semibold text-[var(--leaf-dark)] underline">
        <SectionCopy k="backToShop" fallback="Back to shop" />
      </Link>
    </div>
  );
}
