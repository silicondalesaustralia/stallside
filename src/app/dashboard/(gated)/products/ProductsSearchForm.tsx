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
    <form
      method="get"
      role="search"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-2 sm:gap-3"
    >
      {tab !== "standard" ? <input type="hidden" name="tab" value={tab} /> : null}
      {view === "archived" ? (
        <input type="hidden" name="view" value="archived" />
      ) : null}
      {scope === "all" ? <input type="hidden" name="scope" value="all" /> : null}
      {category ? (
        <input type="hidden" name="category" value={category} />
      ) : null}
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search by name, SKU, or barcode"
        autoComplete="off"
        className="min-w-[12rem] flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="rounded-lg bg-[var(--field)] px-3.5 py-2 text-sm font-semibold text-[var(--ink-on-dark)]"
      >
        Search
      </button>
      {q ? (
        <a
          href={clearHref({ tab, view, scope, category })}
          className="px-2 text-sm font-semibold text-[var(--muted)] underline"
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
