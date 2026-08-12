import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { productDashboardWhere } from "@/lib/product-visibility";
import ProductLifecycleActions from "./ProductLifecycleActions";
import RestockNotifyPanel from "./RestockNotifyPanel";
import { loadRestockPanels } from "./load-restock-panels";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";
import ProductsTabs, {
  isProductTabId,
  type ProductTabId,
} from "./ProductsTabs";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; tab?: string }>;
}) {
  const { user, owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const { view, tab: tabParam } = await searchParams;
  const showArchived = view === "archived";
  const tab: ProductTabId = isProductTabId(tabParam) ? tabParam : "standard";
  const isPreOrder = tab === "preorder";

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        </div>
        <NoBusinessYet />
      </main>
    );
  }

  const showRestock =
    !showArchived &&
    tab === "standard" &&
    isRestockAlertsEnabled() &&
    ownerHasProAccess(owner, {
      email: user.email,
      role: user.role,
      lifetimeAccess: owner.lifetimeAccess,
    });

  const [products, restockPanels] = await Promise.all([
    prisma.product.findMany({
      where: {
        ownerId: owner.id,
        standId: selected.id,
        preOrderEligible: isPreOrder,
        isHidden: false,
        ...(showArchived ? { isArchived: true } : productDashboardWhere),
      },
      select: {
        id: true,
        name: true,
        isHidden: true,
        isArchived: true,
        priceCents: true,
        currency: true,
        costCents: true,
        stockQuantity: true,
        sku: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    showRestock
      ? loadRestockPanels(owner.id, selected.id)
      : Promise.resolve([]),
  ]);

  function listHref(nextView?: "archived") {
    const params = new URLSearchParams();
    if (tab !== "standard") params.set("tab", tab);
    if (nextView) params.set("view", nextView);
    const qs = params.toString();
    return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
  }

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-[var(--muted)]">
            {selected.name}
            {" · "}
            {isPreOrder
              ? "Products available for pre-order pages. Collection day is set on each page."
              : "Name products as you sell them - e.g. Dozen eggs, 500g steak."}
          </p>
          <p className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={listHref()}
              className={
                !showArchived
                  ? "font-semibold text-[var(--ink)]"
                  : "text-[var(--leaf-dark)] underline"
              }
            >
              Active
            </Link>
            <Link
              href={listHref("archived")}
              className={
                showArchived
                  ? "font-semibold text-[var(--ink)]"
                  : "text-[var(--leaf-dark)] underline"
              }
            >
              Archived
            </Link>
          </p>
        </div>
        <Link
          href={
            isPreOrder
              ? "/dashboard/pre-order-pages/new"
              : `/dashboard/products/new?standId=${selected.id}`
          }
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          {isPreOrder ? "New pre-order page" : "Add product"}
        </Link>
      </div>

      <ProductsTabs active={tab} view={view} />

      {isPreOrder && !showArchived ? (
        <p className="text-sm text-[var(--muted)]">
          Group several products on one shareable link:{" "}
          <Link
            href="/dashboard/pre-order-pages"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Pre-order pages
          </Link>
          . Or{" "}
          <Link
            href={`/dashboard/products/new?standId=${selected.id}`}
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            add a single pre-order product
          </Link>
          .
        </p>
      ) : null}

      {restockPanels.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Restock alerts
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {restockPanels.map((panel) => (
              <RestockNotifyPanel key={panel.standId} {...panel} />
            ))}
          </div>
        </section>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {showArchived
            ? `No archived ${isPreOrder ? "pre-order" : "standard"} products.`
            : `No ${isPreOrder ? "pre-order" : "standard"} products yet.`}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">
                  {product.name}
                  {product.isHidden && !product.isArchived ? (
                    <span className="ml-2 text-[var(--muted)]">(hidden)</span>
                  ) : null}
                  {product.isArchived ? (
                    <span className="ml-2 text-[var(--muted)]">(archived)</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[var(--muted)]">
                  {formatMoney(product.priceCents, product.currency)}
                  {product.costCents != null
                    ? ` · profit ${formatMoney(product.priceCents - product.costCents, product.currency)}`
                    : null}{" "}
                  · {product.stockQuantity} in stock
                  {product.sku ? ` · SKU ${product.sku}` : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="text-[var(--leaf-dark)] underline"
                >
                  Edit
                </Link>
                {!product.isArchived ? (
                  <Link
                    href="/dashboard/inventory"
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Adjust stock
                  </Link>
                ) : null}
                <ProductLifecycleActions
                  productId={product.id}
                  productName={product.name}
                  isHidden={product.isHidden}
                  isArchived={product.isArchived}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
