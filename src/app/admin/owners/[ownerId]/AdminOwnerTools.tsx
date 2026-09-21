import AdminLoginAsButton from "@/components/AdminLoginAsButton";
import {
  applyCouponToOwner,
  cancelOwnerSubscription,
  refundLatestSubscriptionInvoice,
  syncOwnerLtvFromStripe,
} from "./actions";

export default function AdminOwnerTools({ ownerId }: { ownerId: string }) {
  const refundAction = refundLatestSubscriptionInvoice.bind(null, ownerId);
  const cancelAction = cancelOwnerSubscription.bind(null, ownerId);
  const syncLtvAction = syncOwnerLtvFromStripe.bind(null, ownerId);

  return (
    <>
      <section className="dash-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Apply signup coupon</h2>
        <p className="text-sm text-[var(--muted)]">
          Applies an active Stripe promotion code to their current subscription.
        </p>
        <form action={applyCouponToOwner} className="flex flex-wrap gap-2">
          <input type="hidden" name="ownerId" value={ownerId} />
          <input
            name="code"
            placeholder="PILOT2026"
            required
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm uppercase"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white"
          >
            Apply code
          </button>
        </form>
      </section>

      <section className="dash-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Support</h2>
        <p className="text-sm text-[var(--muted)]">
          Open their owner dashboard to check settings and troubleshoot. An amber
          banner lets you return to admin.
        </p>
        <AdminLoginAsButton ownerId={ownerId} />
      </section>

      <section className="flex flex-wrap gap-3">
        <form action={syncLtvAction}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
          >
            Sync subscription total from Stripe
          </button>
        </form>
        <form action={refundAction}>
          <button
            type="submit"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800"
          >
            Refund latest invoice
          </button>
        </form>
        <form action={cancelAction}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel at period end
          </button>
        </form>
      </section>
    </>
  );
}
