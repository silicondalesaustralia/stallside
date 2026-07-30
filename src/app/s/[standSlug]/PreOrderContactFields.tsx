"use client";

export default function PreOrderContactFields({
  customerName,
  customerEmail,
  customerPhone,
  onCustomerName,
  onCustomerEmail,
  onCustomerPhone,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onCustomerName: (v: string) => void;
  onCustomerEmail: (v: string) => void;
  onCustomerPhone: (v: string) => void;
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
    </div>
  );
}
