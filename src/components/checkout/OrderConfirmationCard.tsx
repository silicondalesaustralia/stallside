import Link from "next/link";
import DemoCheckoutSuccessRedirect from "@/components/DemoCheckoutSuccessRedirect";
import RestockOptIn from "@/components/RestockOptIn";
import SectionCopy from "@/components/studio/SectionCopy";
import type { SuccessPageState } from "@/app/checkout/success/success-state";
import { PAID_MESSAGE, PENDING_MESSAGE } from "@/app/checkout/success/success-messages";

type Props = {
  state: SuccessPageState;
  backHref: string;
  backLabel: string;
  /** Builder sample: the restock form is shown but can't be submitted. */
  preview?: boolean;
};

function StateMessage({ message }: { message: string }) {
  const className = "mt-3 block text-xl text-[var(--muted)]";
  if (message === PAID_MESSAGE) return <SectionCopy k="paid" fallback={PAID_MESSAGE} as="p" className={className} />;
  if (message === PENDING_MESSAGE) {
    return <SectionCopy k="pending" fallback={PENDING_MESSAGE} as="p" className={className} />;
  }
  return <p className={className}>{message}</p>;
}

/** "Thank you" card shown after card / PayPal checkout; wording is editable in the builder. */
export default function OrderConfirmationCard({ state, backHref, backLabel, preview = false }: Props) {
  const { preOrder, demoStandSlug, demoProduct, restock } = state;
  return (
    <>
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="font-receipt text-4xl text-[var(--leaf)]" aria-hidden>
          ✓
        </p>
        <SectionCopy
          k="heading"
          fallback="Thank you"
          as="h1"
          className="mt-4 block font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]"
        />
        <StateMessage message={state.message} />
        {preOrder ? (
          <div className="mt-6 space-y-2 text-base text-[var(--ink)]">
            <p>
              <SectionCopy k="collect" fallback="Collect:" className="font-semibold" /> {preOrder.collectionLabel}
            </p>
            {preOrder.collectionNote ? <p className="text-[var(--muted)]">{preOrder.collectionNote}</p> : null}
            {preOrder.customerName ? (
              <p>
                <SectionCopy k="name" fallback="Name:" className="font-semibold" /> {preOrder.customerName}
              </p>
            ) : null}
            <ul className="mt-2 list-inside list-disc text-[var(--muted)]">
              {preOrder.items.map((item) => (
                <li key={`${item.name}-${item.quantity}`}>
                  {item.quantity}× {item.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {demoStandSlug && demoProduct ? (
          <DemoCheckoutSuccessRedirect
            product={demoProduct}
            standSlug={demoStandSlug}
            via="card"
            totalCents={state.demoTotalCents}
            currency={state.demoCurrency}
          />
        ) : null}
        {restock && !demoStandSlug ? (
          <RestockOptIn standId={restock.standId} prefillEmail={restock.prefillEmail} preview={preview} />
        ) : null}
      </div>
      {demoStandSlug && demoProduct ? null : (
        <Link
          href={backHref}
          className="mt-8 inline-flex w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-6 py-4 text-lg font-semibold text-[var(--ink)]"
        >
          <SectionCopy k="back" fallback={backLabel} />
        </Link>
      )}
    </>
  );
}
