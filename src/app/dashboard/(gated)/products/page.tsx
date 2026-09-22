import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { productDashboardWhere } from "@/lib/product-visibility";
import RestockNotifyPanel from "./RestockNotifyPanel";
import { loadRestockPanels } from "./load-restock-panels";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { isRestockAlertsEnabled } from "@/lib/restock-alerts";
import ProductsTabs, {
  isProductTabId,
  type ProductTabId,
} from "./ProductsTabs";
import ProductListRow from "./ProductListRow";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { loadProductStockSplits } from "@/lib/suppliers/stock-split";

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
  const isSupplier = tab === "supplier";

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Products
        </h1>
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
        ...(isSupplier
          ? { memberId: { not: null } }
          : {
              memberId: null,
              preOrderEligible: isPreOrder,
              isHidden: false,
            }),
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
        member: { select: { name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    showRestock
      ? loadRestockPanels(owner.id, selected.id)
      : Promise.resolve([]),
  ]);

  const stockSplits = await loadProductStockSplits(products);

  function listHref(nextView?: "archived", nextTab: ProductTabId = tab) {
    const params = new URLSearchParams();
    if (nextTab !== "standard") params.set("tab", nextTab);
    if (nextView === "archived") params.set("view", "archived");
    const qs = params.toString();
    return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {products.length}{" "}
            {isSupplier ? "supplier" : isPreOrder ? "pre-order" : ""} product
            {products.length === 1 ? "" : "s"}
            {showArchived ? " archived" : " in progress"} · {selected.name}
          </p>
        </div>
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProductsTabs active={tab} view={view} />
        <Link
          href={listHref()}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            !showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Active
        </Link>
        <Link
          href={listHref("archived")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Archived
        </Link>
        <Link
          href={listHref(showArchived ? "archived" : undefined, "supplier")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            isSupplier
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Supplier
        </Link>
      </div>

      {isSupplier && !showArchived ? (
        <p className="text-sm text-[var(--muted)]">
          These are products a supplier added. Hide on stand takes them off the
          stall and your website. They stay in this list so you can show them
          again. Set the price and publish from{" "}
          <Link
            href="/dashboard/suppliers"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Suppliers
          </Link>{" "}
          before they can be sold. Unpublished ones are under Archived.
        </p>
      ) : null}

      {isPreOrder && !showArchived ? (
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

      {restockPanels.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {restockPanels.map((panel) => (
            <RestockNotifyPanel key={panel.standId} {...panel} />
          ))}
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {showArchived
            ? `No archived ${isSupplier ? "supplier" : isPreOrder ? "pre-order" : "standard"} products.`
            : `No ${isSupplier ? "supplier" : isPreOrder ? "pre-order" : "standard"} products yet.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => {
            const split = stockSplits.get(product.id);
            return (
              <ProductListRow
                key={product.id}
                product={{
                  ...product,
                  supplierName: product.member?.name ?? null,
                  ownerUnits: split?.ownerUnits ?? null,
                  supplierUnits: split?.supplierUnits ?? null,
                }}
              />
            );
          })}
        </ul>
      )}
    </main>
  );
}
