export default function MembershipDeliveryFields() {
  return (
    <div className="mt-4 grid gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Address</span>
        <input
          name="deliveryAddressLine1"
          required
          autoComplete="street-address"
          className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Suburb</span>
          <input
            name="deliverySuburb"
            required
            className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Postcode</span>
          <input
            name="deliveryPostcode"
            required
            autoComplete="postal-code"
            className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Delivery notes</span>
        <input
          name="deliveryNotes"
          className="rounded-[9px] border border-[var(--m-input-border)] bg-[var(--m-input)] px-3 py-2.5 text-base"
        />
      </label>
    </div>
  );
}
