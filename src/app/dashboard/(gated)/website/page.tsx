import Link from "next/link";
import { requireOwner } from "@/lib/session";
import {
  ensureStorefront,
  storefrontFullUrl,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveStorefront } from "./actions";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";
import { prisma } from "@/lib/prisma";
import { ProductChannelType } from "@/generated/prisma/client";

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const primaryStandId = await primaryStandIdForOwner(owner.id);
  const onlineCount = primaryStandId
    ? await prisma.productChannel.count({
        where: {
          channelType: ProductChannelType.ONLINE,
          standId: primaryStandId,
          isEnabled: true,
          product: { ownerId: owner.id, isArchived: false },
        },
      })
    : 0;

  const publicUrl = storefrontFullUrl(storefront.slug);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Online shop
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Your food-business storefront at{" "}
          <code className="rounded bg-[var(--wash)] px-1 text-xs">/shop/your-slug</code>
          . Farm-stand QR links stay on <code className="text-xs">/s/…</code>.
        </p>
      </div>

      {params.saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Saved.</p>
      ) : null}
      {params.error === "headline" ? (
        <p className="text-sm text-[var(--gone)]">Enter a shop headline.</p>
      ) : null}
      {params.error === "slug" ? (
        <p className="text-sm text-[var(--gone)]">Enter a valid shop URL slug.</p>
      ) : null}

      <div className="dash-card p-4 text-sm">
        <p className="font-medium">Products on online shop</p>
        <p className="mt-1 text-[var(--muted)]">
          {onlineCount} product{onlineCount === 1 ? "" : "s"} with{" "}
          <strong>Show on online shop</strong> enabled in the product editor.
        </p>
        <Link href="/dashboard/products" className="mt-2 inline-block underline">
          Manage products
        </Link>
      </div>

      <form action={saveStorefront} className="dash-card flex max-w-lg flex-col gap-4 p-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Published</span>
          <input type="checkbox" name="isPublished" defaultChecked={storefront.isPublished} />
          <span className="text-xs text-[var(--muted)]">
            When off, /shop/{storefront.slug} returns not found.
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Headline</span>
          <input
            name="headline"
            required
            defaultValue={storefront.headline ?? owner.businessName}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">About (optional)</span>
          <textarea
            name="about"
            rows={4}
            defaultValue={storefront.about ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Shop URL slug</span>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">/shop/</span>
            <input
              name="slug"
              required
              defaultValue={storefront.slug}
              pattern="[a-z0-9-]+"
              className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </div>
        </label>
        {storefront.isPublished ? (
          <p className="text-sm">
            Live:{" "}
            <a href={publicUrl} target="_blank" rel="noreferrer" className="underline">
              {publicUrl}
            </a>
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Preview path: {storefrontPublicPath(storefront.slug)} (publish to go live)
          </p>
        )}
        <button type="submit" className={dashCtaClass}>
          Save shop
        </button>
      </form>

      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/website/domains" className="underline">
          Custom domains
        </Link>{" "}
        — save a domain for later; DNS wiring comes in a follow-up release.
      </p>
    </main>
  );
}
