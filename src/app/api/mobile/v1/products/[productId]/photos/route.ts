import type { NextRequest } from "next/server";
import {
  PRODUCT_PHOTO_UPLOAD_MAX_BYTES,
  productPhotoOrderBody,
  productPhotoQuery,
} from "@/contracts/mobile/product-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { addOwnerProductPhoto, removeOwnerProductPhoto, reorderOwnerProductPhotos } from "@/lib/products/photos";
import { afterProductChange } from "@/lib/mobile/product-detail-response";
import { shrinkPhoto } from "@/lib/mobile/shrink-photo";
import { mobileError, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/products/[productId]/photos">;

/** Adds a photo from the camera or library (multipart field "image"). */
export async function POST(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("image");
  } catch {
    return mobileError(400, "Send the photo as a form upload.");
  }
  if (!(file instanceof File) || file.size === 0) return mobileError(400, "Choose a photo first.");
  if (file.size > PRODUCT_PHOTO_UPLOAD_MAX_BYTES) return mobileError(413, "That photo is too large. Try another one.");
  if (file.type && !file.type.startsWith("image/")) return mobileError(400, "That file isn't a photo.");

  try {
    const { productId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await addOwnerProductPhoto(ownerId, productId, await shrinkPhoto(file));
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile product photo upload failed", error);
  }
}

/** New photo order; the first becomes the main photo. */
export async function PUT(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, productPhotoOrderBody);
  if (!body.ok) return body.response;
  try {
    const { productId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await reorderOwnerProductPhotos(ownerId, productId, body.data.order);
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile product photo reorder failed", error);
  }
}

/** Removes the photo given as ?url=. */
export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, productPhotoQuery);
  if (!query.ok) return query.response;
  try {
    const { productId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await removeOwnerProductPhoto(ownerId, productId, query.data.url);
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile product photo remove failed", error);
  }
}
