"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseOptionGroupsInput } from "@/lib/product-options";
import { parsePriceTiers } from "@/lib/price-tiers";
import { Prisma } from "@/generated/prisma/client";

export async function saveProductOptions(
  productId: string,
  rawGroups: unknown,
) {
  try {
    const { owner } = await requireOwnerWrite();
    const product = await prisma.product.findFirst({
      where: { id: productId, ownerId: owner.id },
      include: { stand: { select: { slug: true, id: true } } },
    });
    if (!product) return { error: "Product not found." };

    const parsed = parseOptionGroupsInput(rawGroups);
    if (!parsed.ok) return { error: parsed.error };
    if (
      parsed.groups.length > 0 &&
      parsePriceTiers(product.priceTiers).length > 0
    ) {
      return {
        error: "Clear volume prices before adding product options.",
      };
    }

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
      if (parsed.groups.length > 0) {
        await tx.product.update({
          where: { id: product.id },
          data: { priceTiers: Prisma.DbNull },
        });
      }
    });

    revalidatePath(`/dashboard/products/${product.id}`);
    revalidatePath(`/s/${product.stand.slug}`);
    revalidateTag(standCatalogTag(product.stand.slug), "max");
    revalidatePath(`/s/${product.stand.slug}/${product.slug}`);
    return { ok: true as const };
  } catch (error) {
    console.error("saveProductOptions failed", error);
    return { error: "Could not save options." };
  }
}
