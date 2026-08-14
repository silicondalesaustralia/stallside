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
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {products.length} {isPreOrder ? "pre-order" : ""} product
            {products.length === 1 ? "" : "s"}
            {showArchived ? " archived" : " in progress"} · {selected.name}
          </p>
        </div>
        <DashPrimaryCta
          href={
            isPreOrder
              ? "/dashboard/pre-order-pages/new"
              : `/dashboard/products/new?standId=${selected.id}`
          }
        >
          {isPreOrder ? "+ New pre-order page" : "+ Add product"}
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
      </div>

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
            ? `No archived ${isPreOrder ? "pre-order" : "standard"} products.`
            : `No ${isPreOrder ? "pre-order" : "standard"} products yet.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductListRow key={product.id} product={product} />
          ))}
        </ul>
      )}
    </main>
  );
}
