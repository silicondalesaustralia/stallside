import { siteSlugOwnersFromConfig } from "@/lib/storefront/resolve-site-slug";
import { isReservedSiteSlug, resolveSiteSlugOwner, shadowedSiteSlugs } from "@/lib/storefront/site-slugs";

const KIND: Record<string, string> = {
  page: "Page",
  category: "Product category",
  blogCategory: "Blog category",
};

/** Warns about pages/categories whose `/{slug}` is taken by a higher-priority item. */
export default async function SiteSlugClashNotice({
  ownerId,
  configRaw,
}: {
  ownerId: string;
  configRaw: unknown;
}) {
  const owners = await siteSlugOwnersFromConfig(ownerId, configRaw);
  const clashes = shadowedSiteSlugs(owners);
  if (clashes.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[var(--gone)] bg-white p-4 text-sm">
      <p className="font-semibold text-[var(--gone)]">Some links can&apos;t be reached</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted)]">
        {clashes.map((o) => {
          const winner = resolveSiteSlugOwner(o.slug, owners);
          return (
            <li key={`${o.kind}-${o.id}`}>
              {KIND[o.kind]} &ldquo;{o.label}&rdquo; uses /{o.slug}, which{" "}
              {isReservedSiteSlug(o.slug) || !winner
                ? "is reserved by your website"
                : `already shows the ${KIND[winner.kind].toLowerCase()} “${winner.label}”`}
              . Rename one of them.
            </li>
          );
        })}
      </ul>
    </div>
  );
}
