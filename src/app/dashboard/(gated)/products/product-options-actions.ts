"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseOptionGroupsInput } from "@/lib/product-options";

export async function saveProductOptions(
  productId: string,
  rawGroups: unknown,
) {
  try {
    const { owner } = await requireOwner();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      include: { stand: { select: { slug: true, id: true } } },
    });
    if (!product) return { error: "Product not found." };

    const parsed = parseOptionGroupsInput(rawGroups);
    if (!parsed.ok) return { error: parsed.error };

    await prisma.$transaction(async (tx) => {
      await tx.productOptionGroup.deleteMany({ where: { productId: product.id } });
      for (let gi = 0; gi < parsed.groups.length; gi++) {
        const g = parsed.groups[gi];
        await tx.productOptionGroup.create({
          data: {
            productId: product.id,
            name: g.name,
            sortOrder: gi,
            choices: {
              create: g.choices.map((c, ci) => ({
                name: c.name,
                priceDeltaCents: c.priceDeltaCents,
                sortOrder: ci,
              })),
            },
          },
        });
      }
    });

    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/s/${product.stand.slug}`);
    revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("saveProductOptions failed", error);
    return { error: "Could not save options." };
  }
}
