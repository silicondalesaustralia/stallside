import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveStorefrontDomain } from "../actions";

export default async function WebsiteDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/website" className="underline">
            Online shop
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Custom domains
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Save your intended domain now. Pointing DNS at Vendl and automatic
          HTTPS will ship in a later release.
        </p>
      </div>

      {params.saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Saved.</p>
      ) : null}

      <form
        action={saveStorefrontDomain}
        className="dash-card flex max-w-lg flex-col gap-4 p-4"
      >
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Custom domain (optional)</span>
          <input
            name="customDomain"
            placeholder="shop.example.com"
            defaultValue={storefront.customDomain ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <button type="submit" className={dashCtaClass}>
          Save domain
        </button>
      </form>
    </main>
  );
}
