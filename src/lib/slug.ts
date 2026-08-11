const RESERVED_PRODUCT_SLUGS = new Set(["cart", "checkout", "pre"]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function uniqueStandSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "stand";
  if (!(await exists(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error("Could not allocate a unique slug");
}

export async function uniqueProductSlug(
  standId: string,
  base: string,
  exists: (standId: string, slug: string) => Promise<boolean>,
  excludeProductId?: string,
): Promise<string> {
  let root = slugify(base) || "item";
  if (RESERVED_PRODUCT_SLUGS.has(root)) root = `${root}-item`;

  const taken = async (slug: string) => {
    if (RESERVED_PRODUCT_SLUGS.has(slug)) return true;
    return exists(standId, slug);
  };

  // exists callback should already exclude current product when editing
  void excludeProductId;

  if (!(await taken(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("Could not allocate a unique product slug");
}

export function isReservedProductSlug(slug: string): boolean {
  return RESERVED_PRODUCT_SLUGS.has(slug);
}
