import type { SiteWideTabId } from "./site-wide-tabs";

/** Where a clicked part of the editor preview is really edited. */
export type EditSource = {
  title: string;
  body: string;
  link?: { href: string; label: string };
  siteWideTab?: SiteWideTabId;
};

/** Parts edited on the page itself (typing, buttons, form fields) keep their normal behaviour. */
const EDITABLE_HERE = '[contenteditable="true"], input, textarea, select, button, label';

const PRODUCT_PARTS: Partial<Record<string, { title: string; body: string }>> = {
  name: { title: "Product name", body: "The name is set on the product." },
  price: { title: "Price", body: "Prices and sale prices are set on the product." },
  description: { title: "Description", body: "The description is written on the product." },
  photos: { title: "Photos", body: "Photos are added on the product." },
};

const productLink = (id: string) => ({ href: `/dashboard/products/${id}`, label: "Edit this product" });

export function resolveEditSource(target: Element): EditSource | null {
  if (target.closest(EDITABLE_HERE)) return null;

  if (target.closest(".sale-badge")) {
    return {
      title: "Sale badge",
      body: "The badge style is shared by every page. Sale prices are set on each product.",
      siteWideTab: "shop",
    };
  }

  const detail = target.closest<HTMLElement>("[data-edit-detail]");
  if (detail?.dataset.editDetail) {
    const part =
      target.closest("[data-edit-field='photos']") ? "photos" : target.closest<HTMLElement>("[data-pd-block]")?.dataset.pdBlock;
    if (part === "rating") {
      return {
        title: "Reviews",
        body: "Stars come from approved reviews. Approve or hide them on the Reviews page.",
        link: { href: "/dashboard/reviews", label: "Open reviews" },
      };
    }
    const copy = part ? PRODUCT_PARTS[part] : undefined;
    return copy ? { ...copy, link: productLink(detail.dataset.editDetail) } : null;
  }

  const card = target.closest<HTMLElement>("[data-edit-product]");
  if (card?.dataset.editProduct) {
    return {
      title: "Product",
      body: "The name, photo and price come from the product. Card style is in this section's settings.",
      link: productLink(card.dataset.editProduct),
    };
  }

  const category = target.closest<HTMLElement>("[data-edit-category]");
  if (category?.dataset.editCategory) {
    return {
      title: "Category",
      body: "The name, photo and description come from the category. Layout is in this section's settings.",
      link: { href: `/dashboard/categories/${category.dataset.editCategory}`, label: "Edit this category" },
    };
  }
  return null;
}
