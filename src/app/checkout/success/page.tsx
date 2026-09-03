import Link from "next/link";
import DemoCheckoutSuccessRedirect from "@/components/DemoCheckoutSuccessRedirect";
import RestockOptIn from "./RestockOptIn";
import { resolveCheckoutSuccess } from "./resolve-checkout-success";
import { APP_NAME } from "@/lib/constants";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
    paypal?: string;
    token?: string;
    sub?: string;
  }>;
}) {
  const params = await searchParams;
  const {
    message,
    demoStandSlug,
    demoProduct,
    demoTotalCents,
    demoCurrency,
    restock,
    preOrder,
    standSlug,
    standName,
  } = await resolveCheckoutSuccess(params);

  const backHref = standSlug ? `/s/${standSlug}` : "/";
  const backLabel = standName ? `Back to ${standName}` : `Back to ${APP_NAME}`;

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <p className="font-receipt text-4xl text-[var(--leaf)]" aria-hidden>
          ✓
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
          Thank you
        </h1>
        <p className="mt-3 text-xl text-[var(--muted)]">{message}</p>
        {preOrder ? (
          <div className="mt-6 space-y-2 text-base text-[var(--ink)]">
            <p>
              <span className="font-semibold">Collect:</span>{" "}
              {preOrder.collectionLabel}
            </p>
            {preOrder.collectionNote ? (
              <p className="text-[var(--muted)]">{preOrder.collectionNote}</p>
            ) : null}
            {preOrder.customerName ? (
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {preOrder.customerName}
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
            totalCents={demoTotalCents}
            currency={demoCurrency}
          />
        ) : null}
        {restock && !demoStandSlug ? (
          <RestockOptIn
            standId={restock.standId}
            prefillEmail={restock.prefillEmail}
          />
        ) : null}
      </div>
      {demoStandSlug && demoProduct ? null : (
        <Link
          href={backHref}
          className="mt-8 inline-flex w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-6 py-4 text-lg font-semibold text-[var(--ink)]"
        >
          {backLabel}
        </Link>
      )}
    </main>
  );
}
