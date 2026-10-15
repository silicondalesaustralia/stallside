import { dashCtaClass } from "@/components/DashPrimaryCta";
import Link from "next/link";
import { startDomainCheckoutAction } from "../purchase-actions";
import { AU_ENTITY_TYPES } from "@/lib/domains/registrar/au-entity-types";

export default function BuyDomainForm({
  domain,
  tld,
  needsAu,
  businessName,
  contactEmail,
  currency,
}: {
  domain: string;
  tld: string;
  needsAu: boolean;
  businessName: string;
  contactEmail: string;
  currency: string;
}) {
  return (
    <form action={startDomainCheckoutAction} className="flex flex-col gap-4">
      <input type="hidden" name="domain" value={domain} />
      <input type="hidden" name="currency" value={currency} />
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold">Registrant</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <Field
          name="organization"
          label="Organisation"
          required={needsAu}
          defaultValue={businessName}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          required
          defaultValue={contactEmail}
        />
        <Field
          name="phone"
          label="Phone"
          type="tel"
          required
          placeholder="0412 345 678"
        />
        <Field name="address1" label="Address" required />
        <Field name="address2" label="Address line 2" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field name="city" label="City" required />
          <Field name="state" label="State" required />
          <Field name="postalCode" label="Postcode" required />
        </div>
        <Field name="country" label="Country" required defaultValue="AU" />
      </fieldset>

      {needsAu ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold">.{tld} eligibility</legend>
          <p className="text-xs text-[var(--muted)]">
            Confirm you are entitled to hold this domain. Vendl does not verify
            ABN/ACN against government registers.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">ID type</span>
            <select
              name="eligibilityIdType"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
              defaultValue="ABN"
            >
              <option value="ABN">ABN</option>
              <option value="ACN">ACN</option>
              <option value="RBN">RBN</option>
              <option value="TM">Trademark</option>
            </select>
          </label>
          <Field name="eligibilityId" label="Number (e.g. 11-digit ABN)" required />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Business type</span>
            <select
              name="eligibilityType"
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
              defaultValue="Sole Trader"
            >
              {AU_ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="text-xs text-[var(--muted)]">
              Must match how your ABN or ACN is registered. ACN holders choose Company.
            </span>
          </label>
        </fieldset>
      ) : null}

      <button type="submit" className={dashCtaClass}>
        Pay and register
      </button>
      <Link
        href="/dashboard/website/domains"
        className="text-center text-sm text-[var(--muted)] underline"
      >
        Cancel
      </Link>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue = "",
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
      />
    </label>
  );
}
