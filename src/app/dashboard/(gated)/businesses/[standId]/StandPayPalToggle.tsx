import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import CheckoutPaymentRow from "./CheckoutPaymentRow";

export default function StandPayPalToggle({
  acceptPayPal,
  paypalReady,
  proAccess,
}: {
  acceptPayPal: boolean;
  paypalReady: boolean;
  proAccess: boolean;
}) {
  const enabled = proAccess && paypalReady;
  const hint = !proAccess
    ? "Pro plan required."
    : paypalReady
      ? "Money goes straight to your PayPal. No Vendl fee."
      : "Connect PayPal above first.";

  return (
    <CheckoutPaymentRow
      name="acceptPayPal"
      checked={enabled && acceptPayPal}
      disabled={!enabled}
      label={
        <>
          <PaymentBrandIcon brand="paypal" />
          PayPal
          <span className="rounded bg-[var(--leaf)]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--leaf-dark)]">
            Pro
          </span>
        </>
      }
      hint={hint}
    />
  );
}
