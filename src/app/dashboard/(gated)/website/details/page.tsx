import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  storefrontFullUrl,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import {
  publishStorefrontAction,
  unpublishStorefrontAction,
} from "../actions";
import ShopDetailsForm from "./ShopDetailsForm";

export default async function WebsiteDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    published?: string;
    unpublished?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const liveUrl = storefrontFullUrl(storefront.slug);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Shop details
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Name, URL, hero image and contact used across your storefront.
            Layout is edited in{" "}
            <Link href="/dashboard/website/studio" className="underline">
              Studio
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {storefront.isPublished ? (
            <>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
              >
                View live site
              </a>
              <form action={unpublishStorefrontAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
                >
                  Unpublish
                </button>
              </form>
            </>
          ) : (
            <form action={publishStorefrontAction}>
              <button type="submit" className={dashCtaClass}>
                Publish site
              </button>
            </form>
          )}
        </div>
      </div>

      {sp.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Details saved.</p>
      ) : null}
      {sp.published ? (
        <p className="text-sm font-medium text-[var(--ok)]">Site published.</p>
      ) : null}
      {sp.unpublished ? (
        <p className="text-sm font-medium text-[var(--ok)]">Site unpublished.</p>
      ) : null}
      {sp.error === "headline" ? (
        <p className="text-sm font-medium text-[var(--gone)]">Shop name is required.</p>
      ) : null}
      {sp.error === "slug" ? (
        <p className="text-sm font-medium text-[var(--gone)]">Enter a valid URL slug.</p>
      ) : null}
      {sp.error === "slug_taken" ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          That URL is already in use. Try a different slug.
        </p>
      ) : null}

      <ShopDetailsForm
        headline={storefront.headline ?? owner.businessName}
        subheadline={storefront.subheadline ?? ""}
        about={storefront.about ?? ""}
        slug={storefront.slug}
        contactEmail={storefront.contactEmail ?? owner.contactEmail}
        showPhone={storefront.showPhone}
        heroImageUrl={storefront.heroImageUrl}
      />

      <p className="text-sm text-[var(--muted)]">
        Public path:{" "}
        <code className="text-xs">{storefrontPublicPath(storefront.slug)}</code>
      </p>
    </main>
  );
}
