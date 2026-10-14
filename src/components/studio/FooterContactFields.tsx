"use client";

import { FOOTER_ADDRESS_MAX, type FooterContact } from "@/lib/studio/footer-settings";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** Contact block in a footer column: address, phone, email and opening hours, all typed freely. */
export default function FooterContactFields({
  contact,
  onChange,
  onRemove,
}: {
  contact: FooterContact;
  onChange: (next: FooterContact) => void;
  onRemove: () => void;
}) {
  const set = (key: keyof FooterContact, value: string) => onChange({ ...contact, [key]: value || undefined });

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-[var(--line)] bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--field)]">Contact / address</p>
        <button type="button" className="text-xs font-semibold text-red-700" onClick={onRemove}>
          Remove
        </button>
      </div>
      <textarea
        className={INPUT}
        rows={3}
        maxLength={FOOTER_ADDRESS_MAX}
        aria-label="Address"
        placeholder={"Address, e.g.\n12 Example Road\nMacclesfield SA 5153"}
        value={contact.address ?? ""}
        onChange={(e) => set("address", e.target.value)}
      />
      <input
        className={INPUT}
        maxLength={40}
        aria-label="Phone"
        placeholder="Phone (optional)"
        value={contact.phone ?? ""}
        onChange={(e) => set("phone", e.target.value)}
      />
      <input
        className={INPUT}
        maxLength={120}
        aria-label="Email"
        placeholder="Email (optional)"
        value={contact.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
      />
      <textarea
        className={INPUT}
        rows={2}
        maxLength={FOOTER_ADDRESS_MAX}
        aria-label="Opening hours"
        placeholder="Opening hours (optional), e.g. Open daily, 8am–6pm"
        value={contact.hours ?? ""}
        onChange={(e) => set("hours", e.target.value)}
      />
    </div>
  );
}
