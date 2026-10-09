import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { entityKeyToParam, entitySeoKey, readEntitySeo } from "@/lib/studio/seo-settings";
import { loadSeoCatalog } from "./actions";

function SeoRow({
  label,
  sublabel,
  href,
  hasCustom,
}: {
  label: string;
  sublabel: string;
  href: string;
  hasCustom: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-semibold text-[var(--field)]">{label}</p>
        <p className="text-sm text-[var(--muted)]">{sublabel}</p>
      </div>
      <div className="flex items-center gap-2">
        {hasCustom ? (
          <span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--leaf-dark)]">
            Custom
          </span>
        ) : (
          <span className="text-xs text-[var(--muted)]">Defaults</span>
        )}
        <Link href={href} className="rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white">
          Edit
        </Link>
      </div>
    </li>
  );
}

function hasCustomSeo(
  seo: ReturnType<typeof readEntitySeo>,
  product?: { seoTitle: string | null; seoDescription: string | null },
): boolean {
  if (product?.seoTitle || product?.seoDescription) return true;
  if (!seo) return false;
  return Boolean(
    seo.seoTitle ||
      seo.seoDescription ||
      seo.ogTitle ||
      seo.ogDescription ||
      seo.ogImageUrl ||
      (seo.robots && seo.robots !== "default"),
  );
}

export default async function WebsiteSeoPage() {
  const { owner } = await requireOwner();
  const catalog = await loadSeoCatalog(owner.id, owner.businessName);
  const { seo, pages, blogPosts, products, categories, menus } = catalog;

  const homeKey = entitySeoKey("home");
  const homeStored = readEntitySeo(seo, homeKey);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Search & social
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Customise how pages appear in Google and when shared on social media. Blank fields use
          smart defaults from your content.
        </p>
        <p className="mt-3">
          <Link
            href="/dashboard/website/seo/redirects"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            URL redirects
          </Link>
          <span className="text-sm text-[var(--muted)]">
            {" "}
            — send old product or page paths to a new URL
          </span>
        </p>
      </div>

      <section>
        <h2 className="font-semibold text-[var(--field)]">Homepage</h2>
        <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <SeoRow
            label="Home"
            sublabel="/"
            href={`/dashboard/website/seo/${entityKeyToParam(homeKey)}`}
            hasCustom={hasCustomSeo(homeStored)}
          />
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-[var(--field)]">Pages</h2>
        <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {pages.map((page) => {
            const key = entitySeoKey("page", page.id);
            return (
              <SeoRow
                key={page.id}
                label={page.title}
                sublabel={`/${page.slug}`}
                href={`/dashboard/website/seo/${entityKeyToParam(key)}`}
                hasCustom={hasCustomSeo(readEntitySeo(seo, key))}
              />
            );
          })}
        </ul>
      </section>

      {blogPosts.length > 0 ? (
        <section>
          <h2 className="font-semibold text-[var(--field)]">Blog posts</h2>
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {blogPosts.map((post) => {
              const key = entitySeoKey("blog", post.id);
              return (
                <SeoRow
                  key={post.id}
                  label={post.title}
                  sublabel={`/blog/${post.slug}`}
                  href={`/dashboard/website/seo/${entityKeyToParam(key)}`}
                  hasCustom={hasCustomSeo(readEntitySeo(seo, key))}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section>
          <h2 className="font-semibold text-[var(--field)]">Products</h2>
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {products.map((product) => {
              const key = entitySeoKey("product", product.id);
              return (
                <SeoRow
                  key={product.id}
                  label={product.name}
                  sublabel={`/products/${product.slug}`}
                  href={`/dashboard/website/seo/${entityKeyToParam(key)}`}
                  hasCustom={hasCustomSeo(readEntitySeo(seo, key), product)}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section>
          <h2 className="font-semibold text-[var(--field)]">Categories</h2>
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {categories.map((cat) => {
              const key = entitySeoKey("category", cat.id);
              return (
                <SeoRow
                  key={cat.id}
                  label={cat.title}
                  sublabel={`/shop/${cat.slug}`}
                  href={`/dashboard/website/seo/${entityKeyToParam(key)}`}
                  hasCustom={hasCustomSeo(readEntitySeo(seo, key))}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {menus.length > 0 ? (
        <section>
          <h2 className="font-semibold text-[var(--field)]">Menus</h2>
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {menus.map((menu) => {
              const key = entitySeoKey("menu", menu.id);
              return (
                <SeoRow
                  key={menu.id}
                  label={menu.title}
                  sublabel={`/menu/${menu.slug}`}
                  href={`/dashboard/website/seo/${entityKeyToParam(key)}`}
                  hasCustom={hasCustomSeo(readEntitySeo(seo, key))}
                />
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
