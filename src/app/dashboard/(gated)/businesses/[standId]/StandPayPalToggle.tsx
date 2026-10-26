import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";

const linkClass = "font-medium text-[var(--leaf-dark)] underline";

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

  return (
    <div
      className={`rounded-xl border border-[var(--line)] p-4${proAccess ? "" : " bg-[var(--wash)] opacity-60"}`}
    >
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptPayPal"
          defaultChecked={enabled && acceptPayPal}
          disabled={!enabled}
          className="mt-1 size-4 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentBrandIcon brand="paypal" />
            PayPal
            <span className="rounded-full bg-[var(--leaf)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--leaf-dark)]">
              Pro
            </span>
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            {!proAccess
              ? "You must be on Pro to take PayPal payments."
              : paypalReady
                ? "Money goes straight to your PayPal. No Vendl fee."
                : "Connect your PayPal account to offer PayPal at checkout."}
          </span>
        </span>
      </label>
      <p className="mt-3 text-sm">
        {!proAccess ? (
          <Link href="/dashboard/settings/billing" className={linkClass}>
            Upgrade to Pro
          </Link>
        ) : (
          <Link href="/dashboard/settings/paypal" className={linkClass}>
            {paypalReady ? "Manage PayPal" : "Connect PayPal"}
          </Link>
        )}
      </p>
    </div>
  );
}
