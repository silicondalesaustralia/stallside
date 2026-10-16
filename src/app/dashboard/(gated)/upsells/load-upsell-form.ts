import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import type { ScopeOption } from "./ScopeChecklist";

export type UpsellFormOptions = {
  offerProducts: ScopeOption[];
  categories: ScopeOption[];
  products: ScopeOption[];
};

/** Products and categories the upsell form can pick from, for one business. */
export async function loadUpsellFormOptions(ownerId: string, standId: string, currency: string): Promise<UpsellFormOptions> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { standId, isArchived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, priceCents: true, isHidden: true, isPreOrder: true },
    }),
    prisma.category.findMany({
      where: { ownerId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
  ]);
  return {
    offerProducts: products
      .filter((p) => !p.isHidden && !p.isPreOrder)
      .map((p) => ({ id: p.id, label: `${p.name} (${formatMoney(p.priceCents, currency)})` })),
    categories: categories.map((c) => ({ id: c.id, label: c.title })),
    products: products.filter((p) => !p.isPreOrder).map((p) => ({ id: p.id, label: p.name })),
  };
}
