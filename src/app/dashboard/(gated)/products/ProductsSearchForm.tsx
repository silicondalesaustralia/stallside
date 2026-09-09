export default function ProductsSearchForm({
  q,
  tab,
  view,
  scope,
  category,
}: {
  q: string;
  tab: string;
  view?: string;
  scope?: string;
  category?: string;
}) {
  return (
    <form className="flex flex-wrap items-center gap-3" method="get">
      {tab !== "standard" ? <input type="hidden" name="tab" value={tab} /> : null}
      {view === "archived" ? (
        <input type="hidden" name="view" value="archived" />
      ) : null}
      {scope === "all" ? <input type="hidden" name="scope" value="all" /> : null}
      {category ? (
        <input type="hidden" name="category" value={category} />
      ) : null}
      <input
        name="q"
        defaultValue={q}
        placeholder="Search name or SKU"
        className="min-w-[12rem] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm sm:max-w-xs"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Search
      </button>
      {q ? (
        <a
          href={clearHref({ tab, view, scope, category })}
          className="text-sm font-semibold text-[var(--muted)] underline"
        >
          Clear
        </a>
      ) : null}
    </form>
  );
}

function clearHref(input: {
  tab: string;
  view?: string;
  scope?: string;
  category?: string;
}): string {
  const params = new URLSearchParams();
  if (input.tab !== "standard") params.set("tab", input.tab);
  if (input.view === "archived") params.set("view", "archived");
  if (input.scope === "all") params.set("scope", "all");
  if (input.category) params.set("category", input.category);
  const qs = params.toString();
  return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
}
