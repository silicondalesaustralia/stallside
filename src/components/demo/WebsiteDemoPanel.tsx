import Link from "next/link";
import {
  GREEN_VALLEY_DEMO_TEMPLATES,
  demoTemplatePath,
  websiteDemoStorefrontSlug,
} from "@/lib/demo";
import { prisma } from "@/lib/prisma";

const TEMPLATE_COPY = {
  artisan: {
    title: "Artisan",
    blurb: "Editorial farm bakery — photography, story and the weekly bake.",
  },
  farmhouse: {
    title: "Farmhouse",
    blurb: "Warm farm-gate feel — stand, place, eggs and seasonal produce.",
  },
  market: {
    title: "Market",
    blurb: "Clean commerce-first shop — browse, bundles and order fast.",
  },
} as const;

export default async function WebsiteDemoPanel() {
  const slug = websiteDemoStorefrontSlug();
  const storefront = await prisma.storefront.findFirst({
    where: { slug },
    select: { isPublished: true, headline: true },
  });

  return (
    <div>
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        One fictional business —{" "}
        <strong className="font-semibold text-[var(--field)]">
          Green Valley Farm &amp; Bakes
        </strong>{" "}
        — shown in all three Website Studio templates. Same products, menus and
        story; only the design changes.
      </p>

      {!storefront?.isPublished ? (
        <div className="mt-6 rounded-[var(--radius)] border border-[var(--warn)]/40 bg-[var(--panel)] px-4 py-4 text-sm">
          <p className="font-semibold text-[var(--field)]">Demo store not seeded yet</p>
          <p className="mt-1 text-[var(--muted)]">
            Run{" "}
            <code className="text-xs">npm run seed:green-valley-demo</code> then
            refresh. Images can be added later.
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {GREEN_VALLEY_DEMO_TEMPLATES.map((id) => {
          const copy = TEMPLATE_COPY[id];
          return (
            <Link
              key={id}
              href={demoTemplatePath(id)}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-5 transition hover:border-[var(--leaf)]"
            >
              <span className="block font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                {copy.title}
              </span>
              <span className="mt-2 block text-sm text-[var(--muted)]">
                {copy.blurb}
              </span>
              <span className="mt-4 inline-block text-sm font-semibold text-[var(--leaf-dark)]">
                Open demo →
              </span>
            </Link>
          );
        })}
      </div>

      {storefront?.isPublished ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Full shop also at{" "}
          <Link href={`/shop/${slug}`} className="underline">
            /shop/{slug}
          </Link>{" "}
          (published template). Use the template switcher on demo URLs to compare
          without changing the seller&apos;s published site.
        </p>
      ) : null}
    </div>
  );
}
