"use client";

export default function PreOrderContactFields({
  customerName,
  customerEmail,
  customerPhone,
  onCustomerName,
  onCustomerEmail,
  onCustomerPhone,
  deliver = false,
  deliveryAddressLine1 = "",
  deliverySuburb = "",
  deliveryPostcode = "",
  deliveryNotes = "",
  onDeliveryAddressLine1,
  onDeliverySuburb,
  onDeliveryPostcode,
  onDeliveryNotes,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onCustomerName: (v: string) => void;
  onCustomerEmail: (v: string) => void;
  onCustomerPhone: (v: string) => void;
  deliver?: boolean;
  deliveryAddressLine1?: string;
  deliverySuburb?: string;
  deliveryPostcode?: string;
  deliveryNotes?: string;
  onDeliveryAddressLine1?: (v: string) => void;
  onDeliverySuburb?: (v: string) => void;
  onDeliveryPostcode?: (v: string) => void;
  onDeliveryNotes?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Your name</span>
        <input
          value={customerName}
          onChange={(e) => onCustomerName(e.target.value)}
          required
          autoComplete="name"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input
          value={customerEmail}
          onChange={(e) => onCustomerEmail(e.target.value)}
          required
          type="email"
          autoComplete="email"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Phone (optional)</span>
        <input
          value={customerPhone}
          onChange={(e) => onCustomerPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
        />
      </label>
      {deliver ? (
        <>
          <p className="pt-1 text-sm font-medium">Delivery address</p>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Street address</span>
            <input
              value={deliveryAddressLine1}
              onChange={(e) => onDeliveryAddressLine1?.(e.target.value)}
              required
              autoComplete="street-address"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Suburb</span>
              <input
                value={deliverySuburb}
                onChange={(e) => onDeliverySuburb?.(e.target.value)}
                required
                autoComplete="address-level2"
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Postcode</span>
              <input
                value={deliveryPostcode}
                onChange={(e) => onDeliveryPostcode?.(e.target.value)}
                required
                autoComplete="postal-code"
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Delivery notes (optional)</span>
            <input
              value={deliveryNotes}
              onChange={(e) => onDeliveryNotes?.(e.target.value)}
              maxLength={200}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
            />
          </label>
        </>
      ) : null}
    </div>
  );
}
