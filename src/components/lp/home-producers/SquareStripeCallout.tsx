export default function SquareStripeCallout() {
  return (
    <div className="mt-8 grid gap-6 rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm sm:p-6 md:grid-cols-2 md:gap-10">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          Keep your Square setup. Bring your inventory with you.
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          Already using Square? Connect your account, sync your existing products and
          inventory, and keep stock up to date between Square and Vendl. Keep using Square
          at markets while Vendl handles your online orders, pre-orders, subscriptions and
          memberships.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Square is currently available for Australian businesses.
        </p>
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
          Choose Stripe or Square.
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          Connect your preferred payment provider and manage your selling tools through
          Vendl.
        </p>
      </div>
    </div>
  );
}
