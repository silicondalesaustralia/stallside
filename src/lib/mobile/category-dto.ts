import type { CategoryDetailResponse, MobileCategory } from "@/contracts/mobile/categories";
import type { OwnerCategoryDetail, OwnerCategoryRow } from "@/lib/categories/load";

export function toMobileCategory(c: OwnerCategoryRow): MobileCategory {
  return {
    id: c.id,
    title: c.title,
    isActive: c.isActive,
    showOnWebsite: c.showOnWebsite,
    productCount: c._count.products,
  };
}

export function toCategoryDetail({ category, products }: OwnerCategoryDetail): CategoryDetailResponse {
  const multiStand = new Set(products.map((p) => p.stand.name)).size > 1;
  const detail = (...parts: (string | null)[]) => parts.filter(Boolean).join(" · ") || null;
  return {
    category: {
      id: category.id,
      title: category.title,
      isActive: category.isActive,
      showOnWebsite: category.showOnWebsite,
      productCount: category.products.length,
    },
    products: category.products.map((l) => ({
      id: l.productId,
      name: l.product.name,
      detail: detail(multiStand ? l.product.stand.name : null),
      imageUrl: l.product.imageUrl,
      isHidden: l.product.isHidden,
    })),
    allProducts: products.map((p) => ({
      id: p.id,
      name: p.name,
      detail: detail(p.sku ? `SKU ${p.sku}` : null, multiStand ? p.stand.name : null),
      imageUrl: null,
      isHidden: false,
    })),
    webPath: `/dashboard/categories/${category.id}`,
  };
}
