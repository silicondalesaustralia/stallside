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
import ProductsSearchForm from "./ProductsSearchForm";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { productOnStandWhere } from "@/lib/catalogue/product-on-stand";
import { productsListHref } from "./products-list-href";
import { loadProductStockSplits } from "@/lib/suppliers/stock-split";
import type { Prisma } from "@/generated/prisma/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    tab?: string;
    scope?: string;
    category?: string;
    q?: string;
  }>;
}) {
  const { user, owner } = await requireOwner();
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);
  const {
    view,
    tab: tabParam,
    scope,
    category: categorySlug,
    q: qParam,
  } = await searchParams;
  const q = (qParam ?? "").trim();
  const showArchived = view === "archived";
  const tab: ProductTabId = isProductTabId(tabParam) ? tabParam : "standard";
  const isPreOrder = tab === "preorder";
  const isSupplier = tab === "supplier";
  const showAll = scope === "all" || (!selected && businesses.length > 0);

  if (!selected && businesses.length === 0) {
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
    Boolean(selected) &&
    isRestockAlertsEnabled() &&
    ownerHasProAccess(owner, {
      email: user.email,
      role: user.role,
      lifetimeAccess: owner.lifetimeAccess,
    });

  const [categories, categoryRow] = await Promise.all([
    prisma.category.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, title: true },
    }),
    categorySlug
      ? prisma.category.findFirst({
          where: { ownerId: owner.id, slug: categorySlug, isActive: true },
          select: { id: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  const searchWhere: Prisma.ProductWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { upc: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [products, restockPanels] = await Promise.all([
    prisma.product.findMany({
      where: {
        ownerId: owner.id,
        ...(showAll || !selected ? {} : productOnStandWhere(selected.id)),
        ...(isSupplier
          ? { memberId: { not: null } }
          : {
              memberId: null,
              preOrderEligible: isPreOrder,
              isHidden: false,
            }),
        ...(showArchived ? { isArchived: true } : productDashboardWhere),
        ...(categoryRow
          ? { categoryLinks: { some: { categoryId: categoryRow.id } } }
          : {}),
        ...searchWhere,
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
        supplyStatus: true,
        sku: true,
        member: { select: { name: true } },
        stand: { select: { name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    showRestock && selected
      ? loadRestockPanels(owner.id, selected.id)
      : Promise.resolve([]),
  ]);

  const stockSplits = await loadProductStockSplits(products);

  const href = (opts: {
    nextView?: "archived" | "active";
    nextScope?: "all" | "selected";
    nextCategory?: string | null;
  }) =>
    productsListHref({
      tab,
      showArchived,
      showAll,
      categorySlug,
      q,
      ...opts,
    });

  const scopeLabel = showAll ? "all locations" : selected?.name ?? "catalogue";
  const categoryLabel = categoryRow ? ` · ${categoryRow.title}` : "";
  const searchLabel = q ? ` · “${q}”` : "";

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
            {showArchived ? " archived" : ""} · {scopeLabel}
            {categoryLabel}
            {searchLabel}
          </p>
        </div>
        <DashPrimaryCta
          href={
            isSupplier
              ? "/dashboard/suppliers"
              : isPreOrder
              ? "/dashboard/pre-order-pages/new"
              : selected
                ? `/dashboard/products/new?standId=${selected.id}`
                : "/dashboard/products/new"
          }
        >
          {isSupplier
            ? "Suppliers"
            : isPreOrder
              ? "+ New pre-order page"
              : "+ Add product"}
        </DashPrimaryCta>
      </div>

      <ProductsSearchForm
        q={q}
        tab={tab}
        view={view}
        scope={showAll ? "all" : undefined}
        category={categorySlug}
      />

      <div className="flex flex-wrap items-center gap-2">
        <ProductsTabs
          active={tab}
          view={view}
          scope={showAll ? "all" : undefined}
          category={categorySlug}
          q={q || undefined}
        />
        {businesses.length > 1 ? (
          <>
            <Link
              href={href({ nextScope: "selected" })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                !showAll
                  ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                  : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
              }`}
            >
              Selected
            </Link>
            <Link
              href={href({ nextScope: "all" })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                showAll
                  ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                  : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
              }`}
            >
              All locations
            </Link>
          </>
        ) : null}
        <Link
          href={href({ nextView: "active" })}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            !showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Active
        </Link>
        <Link
          href={href({ nextView: "archived" })}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Archived
        </Link>
        <Link
          href={productsListHref({
            tab: "supplier",
            showArchived,
            showAll,
            categorySlug,
            q,
          })}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            isSupplier
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Supplier
        </Link>
      </div>

      {categories.length > 0 && !isPreOrder ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={href({ nextCategory: null })}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              !categorySlug
                ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
            }`}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={href({ nextCategory: c.slug })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                categorySlug === c.slug
                  ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                  : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>
      ) : null}

      {isSupplier && !showArchived ? (
        <p className="text-sm text-[var(--muted)]">
          These are products a supplier added. Hide in shop takes them off the
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
          {q
            ? `No products match “${q}”.`
            : showArchived
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
                  locationName: showAll ? product.stand.name : null,
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
