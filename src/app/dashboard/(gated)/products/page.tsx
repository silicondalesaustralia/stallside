import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { listStandProducts } from "@/lib/products/list";
import ProductsTabs, { productTabFrom } from "./ProductsTabs";
import ProductsTable from "./ProductsTable";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import ProductsSearchForm from "./ProductsSearchForm";
import ProductShopOrder from "./ProductShopOrder";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadProductStockSplits } from "@/lib/suppliers/stock-split";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";
import { ownerSiteUrl } from "@/lib/storefront/owner-site-url";
import { shopPagePath } from "@/lib/storefront/paths";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; tab?: string; q?: string; arrange?: string }>;
}) {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const { view, tab: tabParam, q: qParam, arrange: arrangeParam } = await searchParams;
  const q = (qParam ?? "").trim();
  const tab = productTabFrom(tabParam, view);
  const isPreOrder = tab === "preorder";
  const isSupplier = tab === "supplier";
  const isDraft = tab === "draft";
  const arrange = arrangeParam === "1" && tab === "standard";
  const kind = isSupplier ? "supplier" : isPreOrder ? "pre-order" : isDraft ? "draft" : "standard";

  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Products" />
        <NoBusinessYet />
      </main>
    );
  }

  const products = await listStandProducts({ ownerId: owner.id, standId: selected.id, tab, q });

  const [stockSplits, shopUrl] = await Promise.all([
    loadProductStockSplits(products),
    ownerSiteUrl(owner.id, (slug, draft, base) => shopPagePath(slug, "shop", draft, base)),
  ]);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Products"
        subtitle={`${products.length} ${kind === "standard" ? "" : `${kind} `}product${
          products.length === 1 ? "" : "s"
        } · ${selected.name}${q ? ` · “${q}”` : ""}`}
        actions={
        <>
          {shopUrl ? <ViewOnSiteLink href={shopUrl} label="View shop" /> : null}
          <DashPrimaryCta
            href={
              isSupplier
                ? "/dashboard/suppliers"
                : isPreOrder
                  ? "/dashboard/pre-order-pages/new"
                  : `/dashboard/products/new?standId=${selected.id}`
            }
          >
            {isSupplier
              ? "Suppliers"
              : isPreOrder
                ? "+ New pre-order page"
                : "+ Add product"}
          </DashPrimaryCta>
        </>
        }
      />

      <ProductsSearchForm q={q} tab={tab} />

      <div className="flex flex-wrap items-center gap-2">
        <ProductsTabs active={tab} />
        {tab === "standard" && !arrange ? (
          <Link
            href="/dashboard/products?arrange=1"
            className="ml-auto text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            Arrange shop order
          </Link>
        ) : null}
      </div>

      {isDraft ? (
        <p className="text-sm text-[var(--muted)]">
          Drafts aren&apos;t in your shop. Publish one to put it back on sale.
        </p>
      ) : null}

      {isSupplier ? (
        <p className="text-sm text-[var(--muted)]">
          These are products a supplier added. Unpublish takes them off the
          stall and your website; they stay here as drafts. Set the price and publish from{" "}
          <Link
            href="/dashboard/suppliers"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Suppliers
          </Link>{" "}
          before they can be sold.
        </p>
      ) : null}

      {isPreOrder ? (
        <p className="text-sm text-[var(--muted)]">
          Group several products on one shareable{" "}
          <Link
            href="/dashboard/pre-order-pages"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            pre-order page
          </Link>
          .
        </p>
      ) : null}

      {arrange ? (
        <ProductShopOrder ownerId={owner.id} standId={selected.id} />
      ) : products.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          {isDraft ? "No drafts." : `No ${kind} products yet.`}
        </div>
      ) : (
        <ProductsTable
          products={products.map((product) => {
            const split = stockSplits.get(product.id);
            return {
              ...product,
              ownerUnits: split?.ownerUnits ?? null,
              supplierUnits: split?.supplierUnits ?? null,
            };
          })}
        />
      )}
    </main>
  );
}
