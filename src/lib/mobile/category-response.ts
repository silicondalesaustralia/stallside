import type { CategoryDetailResponse } from "@/contracts/mobile/categories";
import type { OrderActionResult } from "@/lib/categories/category-admin";
import { getOwnerCategoryDetail } from "@/lib/categories/load";
import { toCategoryDetail } from "@/lib/mobile/category-dto";
import { mobileError, mobileJson } from "@/lib/mobile/http";

const NOT_FOUND = "Category not found.";

/** The category as the app shows it, or 404. */
export async function categoryDetailResponse(ownerId: string, categoryId: string) {
  const detail = await getOwnerCategoryDetail(ownerId, categoryId);
  if (!detail) return mobileError(404, NOT_FOUND);
  return mobileJson<CategoryDetailResponse>(toCategoryDetail(detail));
}

/** Turns a shared category service result into the updated category or an error response. */
export async function afterCategoryChange(ownerId: string, categoryId: string, result: OrderActionResult) {
  if ("error" in result) return mobileError(result.error === NOT_FOUND ? 404 : 400, result.error);
  return categoryDetailResponse(ownerId, categoryId);
}
