import type { NextRequest } from "next/server";
import { categoryOrderBody, categoryProductsBody } from "@/contracts/mobile/categories";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { saveOwnerCategoryProductOrder, setOwnerCategoryProducts } from "@/lib/categories/products";
import { afterCategoryChange } from "@/lib/mobile/category-response";
import { mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/categories/[categoryId]/products">;

/** Which products are in the category; new ones go last. */
export async function PUT(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, categoryProductsBody);
  if (!body.ok) return body.response;
  try {
    const { categoryId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await setOwnerCategoryProducts(ownerId, categoryId, body.data.productIds);
    return await afterCategoryChange(ownerId, categoryId, result);
  } catch (error) {
    return mobileServerError("Mobile category products failed", error);
  }
}

/** Product order inside the category. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, categoryOrderBody);
  if (!body.ok) return body.response;
  try {
    const { categoryId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await saveOwnerCategoryProductOrder(ownerId, categoryId, body.data.order);
    return await afterCategoryChange(ownerId, categoryId, result);
  } catch (error) {
    return mobileServerError("Mobile category product order failed", error);
  }
}
