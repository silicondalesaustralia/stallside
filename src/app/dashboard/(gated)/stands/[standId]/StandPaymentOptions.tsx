import Link from "next/link";
import { localTransferForCurrency } from "@/lib/local-transfer";

export type StandPaymentOptionsProps = {
  currency: string;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
  cardReady: boolean;
  paypalReady: boolean;
  cardTier: boolean;
};

function Row({
  label,
  status,
  detail,
}: {
  label: string;
  status: "on" | "off" | "na";
  detail: string;
}) {
  const badge =
    status === "on" ? "On" : status === "off" ? "Off" : "N/A";
  const tone =
    status === "on"
      ? "text-[var(--leaf-dark)]"
      : "text-[var(--muted)]";
  return (
    <li className="flex flex-col gap-0.5 border-b border-[var(--line)] py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${tone}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">{detail}</p>
    </li>
  );
}

export default function StandPaymentOptions({
  currency,
  localTransferAlias,
  localTransferMethodId,
  cardReady,
  paypalReady,
  cardTier,
}: StandPaymentOptionsProps) {
  const method = localTransferForCurrency(currency);
  const alias = localTransferAlias?.trim() ?? "";
  const localOn = Boolean(
    method && alias && localTransferMethodId === method.id,
  );

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="text-lg font-semibold">Checkout payments</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        What customers see after they scan this stand&apos;s QR. Currency:{" "}
        {currency}.
      </p>
      <ul className="mt-2">
        <Row
          label="Cash"
          status="on"
          detail="Always available at every stand."
        />
        <Row
          label={method ? method.buttonLabel.replace(/^Pay with /i, "") : "Bank transfer"}
          status={!method ? "na" : localOn ? "on" : "off"}
          detail={
            !method
              ? `No local bank method for ${currency} yet (PayID is AUD only).`
              : localOn
                ? `Showing your ${method.aliasLabel} at checkout.`
                : `Add your ${method.aliasLabel} in stand details below to enable.`
          }
        />
        <Row
          label="Card / Tap & Go"
          status={!cardTier ? "na" : cardReady ? "on" : "off"}
          detail={
            !cardTier
              ? "Card plan feature — connect Stripe when Card billing is live."
              : cardReady
                ? "Stripe connected. Works in all stand currencies."
                : "Connect Stripe in Settings to offer card at this stand."
          }
        />
        <Row
          label="PayPal"
          status={!cardTier ? "na" : paypalReady ? "on" : "off"}
          detail={
            !cardTier
              ? "Card plan feature — connect PayPal in Settings."
              : paypalReady
                ? "PayPal on. Works in all stand currencies, including USD."
                : "Connect PayPal in Settings and turn it on at checkout."
          }
        />
      </ul>
      {cardTier ? (
        <p className="mt-3 text-sm">
          <Link
            href="/dashboard/settings"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Manage Stripe &amp; PayPal in Settings
          </Link>
        </p>
      ) : null}
    </section>
  );
}
