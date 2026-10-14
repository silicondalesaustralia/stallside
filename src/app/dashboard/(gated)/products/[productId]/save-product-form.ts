import { updateProduct } from "../actions";
import { saveProductOptions } from "../product-options-actions";
import { setProductCategories } from "../../categories/category-product-actions";

/**
 * Saves everything on the product form with one click. Options go first so clearing them
 * and adding volume prices in the same save works. Returns an error message, or null.
 */
export async function saveProductForm(productId: string, savedOptionsJson: string, formData: FormData): Promise<string | null> {
  const options = formData.get("optionsJson");
  if (typeof options === "string" && options !== savedOptionsJson) {
    const groups: unknown = JSON.parse(options);
    const result = await saveProductOptions(productId, groups);
    if ("error" in result) return `Options: ${result.error}`;
  }

  const product = await updateProduct(productId, formData);
  if (product && "error" in product && product.error) return product.error;

  if (formData.has("categoriesShown")) {
    const categories = await setProductCategories(productId, formData);
    if ("error" in categories) return `Categories: ${categories.error}`;
  }
  return null;
}
