/** Build /dashboard/products URL preserving tab, archive, scope, category, and search. */
export function productsListHref(input: {
  tab: string;
  showArchived: boolean;
  showAll: boolean;
  categorySlug?: string;
  q?: string;
  nextView?: "archived" | "active";
  nextScope?: "all" | "selected";
  nextCategory?: string | null;
  nextQ?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input.tab !== "standard") params.set("tab", input.tab);

  const archived =
    input.nextView === "archived"
      ? true
      : input.nextView === "active"
        ? false
        : input.showArchived;
  if (archived) params.set("view", "archived");

  const scopeAll =
    input.nextScope === "all"
      ? true
      : input.nextScope === "selected"
        ? false
        : input.showAll;
  if (scopeAll) params.set("scope", "all");

  const cat =
    input.nextCategory === null
      ? undefined
      : input.nextCategory !== undefined
        ? input.nextCategory
        : input.categorySlug;
  if (cat) params.set("category", cat);

  const query =
    input.nextQ === null
      ? undefined
      : input.nextQ !== undefined
        ? input.nextQ
        : input.q;
  const trimmed = query?.trim();
  if (trimmed) params.set("q", trimmed);

  const qs = params.toString();
  return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
}
