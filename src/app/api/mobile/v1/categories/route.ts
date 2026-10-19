import {
  categoryOrderBody,
  createCategoryBody,
  type CategoriesResponse,
  type CategoryIdResponse,
} from "@/contracts/mobile/categories";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { listOwnerCategories } from "@/lib/categories/load";
import { createOwnerCategory, saveOwnerCategoryOrder } from "@/lib/categories/manage";
import { toMobileCategory } from "@/lib/mobile/category-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

async function listResponse(ownerId: string) {
  const categories = await listOwnerCategories(ownerId);
  return mobileJson<CategoriesResponse>({ categories: categories.map(toMobileCategory) });
}

/** Categories are shared by all the owner's businesses, in shop-menu order. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return await listResponse(guard.value.owner.id);
  } catch (error) {
    return mobileServerError("Mobile categories failed", error);
  }
}

export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, createCategoryBody);
  if (!body.ok) return body.response;
  try {
    const result = await createOwnerCategory(guard.value.owner.id, body.data.title);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<CategoryIdResponse>({ id: result.id }, 201);
  } catch (error) {
    return mobileServerError("Mobile category create failed", error);
  }
}

/** New shop-menu order. */
export async function PUT(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, categoryOrderBody);
  if (!body.ok) return body.response;
  try {
    const ownerId = guard.value.owner.id;
    const result = await saveOwnerCategoryOrder(ownerId, body.data.order);
    if ("error" in result) return mobileError(400, result.error);
    return await listResponse(ownerId);
  } catch (error) {
    return mobileServerError("Mobile category order failed", error);
  }
}
