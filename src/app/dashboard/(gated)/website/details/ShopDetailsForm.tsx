import { dashCtaClass } from "@/components/DashPrimaryCta";
import { storefrontSubdomainHost } from "@/lib/tenancy/public-url";
import { saveStorefrontDetails } from "../actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

type Props = {
  headline: string;
  subheadline: string;
  about: string;
  slug: string;
  contactEmail: string;
  showPhone: boolean;
};

export default function ShopDetailsForm({
  headline,
  subheadline,
  about,
  slug,
  contactEmail,
  showPhone,
}: Props) {
  const publicHost = storefrontSubdomainHost(slug || "your-shop");
  return (
    <form
      action={saveStorefrontDetails}
      className="space-y-5 rounded-2xl border border-[var(--line)] bg-white p-5"
    >
      <label className="block text-sm">
        <span className="font-medium">Shop name</span>
        <input
          name="headline"
          required
          defaultValue={headline}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Tagline</span>
        <input
          name="subheadline"
          defaultValue={subheadline}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">About</span>
        <textarea
          name="about"
          rows={4}
          defaultValue={about}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">URL slug</span>
        <input name="slug" required defaultValue={slug} className={inputClass} />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Your site: {publicHost}
          {slug ? "" : " (updates with the slug)"}
        </span>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Contact email</span>
        <input
          name="contactEmail"
          type="email"
          defaultValue={contactEmail}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showPhone" defaultChecked={showPhone} />
        Show phone number on the storefront
      </label>
      <button type="submit" className={dashCtaClass}>
        Save details
      </button>
    </form>
  );
}
