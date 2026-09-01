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
import { productOnStandWhere } from "@/lib/catalogue/product-on-stand";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    tab?: string;
    scope?: string;
    category?: string;
  }>;
}) {
  const { user, owner } = await requireOwner();
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);
  const { view, tab: tabParam, scope, category: categorySlug } =
    await searchParams;
  const showArchived = view === "archived";
  const tab: ProductTabId = isProductTabId(tabParam) ? tabParam : "standard";
  const isPreOrder = tab === "preorder";
  const showAll =
    scope === "all" || (!selected && businesses.length > 0);

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

  const [products, restockPanels] = await Promise.all([
    prisma.product.findMany({
      where: {
        ownerId: owner.id,
        ...(showAll || !selected ? {} : productOnStandWhere(selected.id)),
        preOrderEligible: isPreOrder,
        isHidden: false,
        ...(showArchived ? { isArchived: true } : productDashboardWhere),
        ...(categoryRow
          ? {
              categoryLinks: { some: { categoryId: categoryRow.id } },
            }
          : {}),
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
        stand: { select: { name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    showRestock && selected
      ? loadRestockPanels(owner.id, selected.id)
      : Promise.resolve([]),
  ]);

  function listHref(
    nextView?: "archived",
    nextScope?: "all" | "selected",
    nextCategory?: string | null,
  ) {
    const params = new URLSearchParams();
    if (tab !== "standard") params.set("tab", tab);
    if (nextView) params.set("view", nextView);
    const scopeVal =
      nextScope === "all"
        ? "all"
        : nextScope === "selected"
          ? undefined
          : showAll
            ? "all"
            : undefined;
    if (scopeVal === "all") params.set("scope", "all");
    const cat =
      nextCategory === null
        ? undefined
        : nextCategory ?? categorySlug ?? undefined;
    if (cat) params.set("category", cat);
    const qs = params.toString();
    return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
  }

  const scopeLabel = showAll
    ? "all locations"
    : selected?.name ?? "catalogue";
  const categoryLabel = categoryRow ? ` · ${categoryRow.title}` : "";

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
            {showArchived ? " archived" : ""} · {scopeLabel}
            {categoryLabel}
          </p>
        </div>
        <DashPrimaryCta
          href={
            isPreOrder
              ? "/dashboard/pre-order-pages/new"
              : selected
                ? `/dashboard/products/new?standId=${selected.id}`
                : "/dashboard/products/new"
          }
        >
          {isPreOrder ? "+ New pre-order page" : "+ Add product"}
        </DashPrimaryCta>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProductsTabs active={tab} view={view} scope={showAll ? "all" : undefined} />
        {businesses.length > 1 ? (
          <>
            <Link
              href={listHref(showArchived ? "archived" : undefined, "selected")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                !showAll
                  ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                  : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
              }`}
            >
              Selected
            </Link>
            <Link
              href={listHref(showArchived ? "archived" : undefined, "all")}
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
          href={listHref(undefined, showAll ? "all" : "selected")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            !showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Active
        </Link>
        <Link
          href={listHref("archived", showAll ? "all" : "selected")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            showArchived
              ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
              : "bg-white text-[var(--ink)] outline outline-[var(--line)]"
          }`}
        >
          Archived
        </Link>
      </div>

      {categories.length > 0 && !isPreOrder ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={listHref(showArchived ? "archived" : undefined, undefined, null)}
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
              href={listHref(
                showArchived ? "archived" : undefined,
                undefined,
                c.slug,
              )}
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
            <ProductListRow
              key={product.id}
              product={{
                ...product,
                locationName: showAll ? product.stand.name : null,
              }}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

