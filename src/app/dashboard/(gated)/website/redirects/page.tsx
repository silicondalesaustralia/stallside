import WebsiteFormError from "@/components/website/WebsiteFormError";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { secondaryButtonClass } from "@/components/dashboard/ui/button-styles";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractStorefrontRedirects } from "@/lib/studio/redirects";
import { publishStorefrontRedirects } from "./actions";
import RedirectAddForm from "./RedirectAddForm";
import RedirectsTable from "./RedirectsTable";

export default async function WebsiteSeoRedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    published?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const redirects = extractStorefrontRedirects(storefront.draftConfig);
  const published = extractStorefrontRedirects(storefront.publishedConfig);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 pb-12">
      <PageHeader
        title="URL redirects"
        subtitle={
          <>
            Send old storefront paths to a new page after you change a slug. Paths are relative to your shop (e.g.{" "}
            <code>/products/old-name</code>). &quot;Publish redirects only&quot; makes just this list live; other
            website edits stay in your draft. Publishing your website also publishes redirects.
          </>
        }
        actions={
          <form action={publishStorefrontRedirects}>
            <button type="submit" className={secondaryButtonClass}>
              Publish redirects only
            </button>
          </form>
        }
      />

      {sp.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Redirect saved.</p>
      ) : null}
      {sp.deleted ? (
        <p className="text-sm font-medium text-[var(--ok)]">Redirect deleted.</p>
      ) : null}
      {sp.published ? (
        <p className="text-sm font-medium text-[var(--ok)]">
          Redirects published to the live site.
        </p>
      ) : null}
      <WebsiteFormError
        error={sp.error}
        fallback={
          sp.error === "duplicate"
            ? "A redirect already exists for that from path."
            : "Check both paths — use storefront paths like /products/slug, or a full https URL for the destination."
        }
      />

      <RedirectAddForm />

      {redirects.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No redirects yet.</div>
      ) : (
        <RedirectsTable redirects={redirects} published={published} />
      )}
    </main>
  );
}
