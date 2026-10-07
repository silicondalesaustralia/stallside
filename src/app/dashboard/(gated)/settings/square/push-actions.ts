"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { pushProductsToSquare } from "@/lib/square/catalog-push";
import { SquareApiError } from "@/lib/square/client";

export async function pushProductsToSquareAction(
  productIds: string[],
): Promise<{ ok: true; message: string } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    if (productIds.length === 0) return { error: "Pick at least one product." };
    const result = await pushProductsToSquare({ ownerId: owner.id, productIds });
    if ("error" in result) return result;

    revalidatePath("/dashboard/settings/square");
    const parts = [
      `Added ${result.created} product${result.created === 1 ? "" : "s"} to Square`,
    ];
    if (result.stockSet > 0) parts.push(`set stock on ${result.stockSet}`);
    if (result.failed > 0) parts.push(`${result.failed} could not be added`);
    return { ok: true, message: `${parts.join(", ")}.` };
  } catch (error) {
    console.error("Push products to Square failed", error);
    if (error instanceof SquareApiError && error.status === 409) {
      return {
        error:
          "Square is still processing an earlier change. Wait a minute and push again — products already added won't be duplicated.",
      };
    }
    return {
      error:
        error instanceof Error
          ? `Square rejected the push: ${error.message}`
          : "Could not push products to Square.",
    };
  }
}
