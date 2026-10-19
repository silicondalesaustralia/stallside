import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { updateCategoryBody } from "@/contracts/mobile/categories";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerCategoryDetail } from "@/lib/categories/load";
import { deleteOwnerCategory, setOwnerCategoryActive, updateOwnerCategory } from "@/lib/categories/manage";
import { afterCategoryChange, categoryDetailResponse } from "@/lib/mobile/category-response";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/categories/[categoryId]">;

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { categoryId } = await ctx.params;
    return await categoryDetailResponse(guard.value.owner.id, categoryId);
  } catch (error) {
    return mobileServerError("Mobile category failed", error);
  }
}

/** Rename, show in shop menu, publish: send only what changed. Description and image stay as they are. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, updateCategoryBody);
  if (!body.ok) return body.response;
  try {
    const { categoryId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const { title, showOnWebsite, isActive } = body.data;

    if (title !== undefined || showOnWebsite !== undefined) {
      const current = await getOwnerCategoryDetail(ownerId, categoryId);
      if (!current) return mobileError(404, "Category not found.");
      const result = await updateOwnerCategory(ownerId, categoryId, {
        title: title ?? current.category.title,
        showOnWebsite: showOnWebsite ?? current.category.showOnWebsite,
      });
      if ("error" in result) return afterCategoryChange(ownerId, categoryId, result);
    }
    if (isActive !== undefined) {
      const result = await setOwnerCategoryActive(ownerId, categoryId, isActive);
      if ("error" in result) return afterCategoryChange(ownerId, categoryId, result);
    }
    return await categoryDetailResponse(ownerId, categoryId);
  } catch (error) {
    return mobileServerError("Mobile category update failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { categoryId } = await ctx.params;
    const result = await deleteOwnerCategory(guard.value.owner.id, categoryId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile category delete failed", error);
  }
}
