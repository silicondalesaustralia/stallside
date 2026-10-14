import SectionCopy from "@/components/studio/SectionCopy";
import { CHECKOUT_COPY, type CheckoutCopyKey } from "@/lib/storefront/checkout-copy";

const GROUPS: { title: string; keys: CheckoutCopyKey[] }[] = [
  { title: "Choosing how to pay", keys: ["payHeading", "reserveHeading", "payCash", "cardButton", "noPayment", "backToCart"] },
  {
    title: "Pre-order contact & delivery details",
    keys: ["nameLabel", "emailLabel", "phoneLabel", "deliveryHeading", "streetLabel", "suburbLabel", "postcodeLabel", "deliveryNotesLabel"],
  },
];

/** Builder list of the checkout step wording so each label can be edited in place. */
export default function CheckoutCopyPreview() {
  return (
    <>
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{group.title}</p>
          <ul className="mt-2 flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
            {group.keys.map((k) => (
              <li key={k}>
                <SectionCopy k={k} fallback={CHECKOUT_COPY[k]} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
