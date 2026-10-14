import Link from "next/link";
import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import { studioEditorPath } from "@/lib/studio/editor-target";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";

/** Home page in the dashboard: search & social settings; content is edited on the site. */
export default function HomePageSettings({
  ownerId,
  businessName,
  storefrontSlug,
  previewUrl,
  seoStatus,
}: {
  ownerId: string;
  businessName: string;
  storefrontSlug: string;
  previewUrl: string;
  seoStatus?: string;
}) {
  return (
    <main className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/website/pages" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
            ← Pages
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
            Edit: Home
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your home page is always published while your website is live.
          </p>
        </div>
        <ViewOnSiteLink href={previewUrl} />
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold text-[var(--field)]">Content and layout</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Edit the home page sections and text right on your site.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={studioEditorPath(storefrontSlug)}
            className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Edit this page
          </Link>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold underline">
            Preview
          </a>
        </div>
      </section>

      <EntitySeoCard
        ownerId={ownerId}
        businessName={businessName}
        entityKey="home"
        returnTo="/dashboard/website/pages/home"
        status={seoStatus}
      />
    </main>
  );
}
