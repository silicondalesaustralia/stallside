"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  HandoverMode,
  MenuKind,
  PaymentTiming,
  type Prisma,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parsePreOrderFromForm } from "@/lib/pre-order";
import { slugify } from "@/lib/slug";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  clearOrphanedScheduleFlags,
  scheduleFromMenu,
} from "@/lib/menu-schedule";
import { standMenuDetailPath } from "@/lib/stand-seo";

type Tx = Prisma.TransactionClient;

async function uniqueMenuSlug(
  standId: string,
  base: string,
  excludeId?: string,
) {
  let root = slugify(base) || "menu";
  if (["cart", "checkout", "pre", "sub", "menu"].includes(root)) {
    root = `${root}-list`;
  }
  const taken = async (slug: string) => {
    const hit = await prisma.menu.findFirst({
      where: {
        standId,
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(hit);
  };
  if (!(await taken(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("Could not allocate a slug");
}

function productIdsFromForm(formData: FormData): string[] {
  return [
    ...new Set(
      formData
        .getAll("productIds")
        .map(String)
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
}

async function assertProductsAvailable(input: {
  productIds: string[];
  standId: string;
  ownerId: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      id: { in: input.productIds },
      standId: input.standId,
      ownerId: input.ownerId,
      isArchived: false,
      isHidden: false,
    },
    select: { id: true },
  });
  if (products.length !== input.productIds.length) {
    return { error: "One or more products are unavailable." as const };
  }
  return { ok: true as const };
}

async function assertNoScheduleClash(productIds: string[], excludeMenuId?: string) {
  const onPage = await prisma.preOrderPageProduct.findFirst({
    where: { productId: { in: productIds } },
    select: { id: true },
  });
  if (onPage) {
    return {
      error:
        "These products are on a pre-order page. Use pre-order pages or remove them there first.",
    } as const;
  }
  const onOtherMenu = await prisma.menuProduct.findFirst({
    where: {
      productId: { in: productIds },
      menu: {
        kind: MenuKind.PREORDER_DROP,
        ...(excludeMenuId ? { NOT: { id: excludeMenuId } } : {}),
      },
    },
    select: { id: true },
  });
  if (onOtherMenu) {
    return {
      error: "A product can only be on one scheduled menu drop at a time.",
    } as const;
  }
  return { ok: true as const };
}

export async function createMenu(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Create a business first." };

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { id: true, slug: true, timezone: true },
  });
  if (!stand) return { error: "Create a business first." };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2–120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const kind =
    String(formData.get("kind") ?? "") === MenuKind.PREORDER_DROP
      ? MenuKind.PREORDER_DROP
      : MenuKind.ALWAYS_AVAILABLE;
  const productIds = productIdsFromForm(formData);
  if (productIds.length < 1) {
    return { error: "Select at least one product." };
  }

  const productsOk = await assertProductsAvailable({
    productIds,
    standId: stand.id,
    ownerId: owner.id,
  });
  if ("error" in productsOk) return productsOk;

  let schedule: ReturnType<typeof scheduleFromMenu> = null;
  if (kind === MenuKind.PREORDER_DROP) {
    const clash = await assertNoScheduleClash(productIds);
    if ("error" in clash) return clash;
    formData.set("isPreOrder", "true");
    const pre = parsePreOrderFromForm(
      formData,
      true,
      Boolean(owner.stripeAccountId && owner.stripeChargesEnabled),
      stand.timezone,
    );
    if (!pre.ok) return { error: pre.error };
    if (!pre.data.isPreOrder) {
      return { error: "Set order-by and collection times for a pre-order drop." };
    }
    schedule = {
      isPreOrder: true,
      orderByAt: pre.data.orderByAt,
      collectionAt: pre.data.collectionAt,
      collectionNote: pre.data.collectionNote,
      showExactStock: pre.data.showExactStock,
      paymentTiming:
        pre.data.paymentTiming === "DEPOSIT_THEN_BALANCE"
          ? PaymentTiming.DEPOSIT_THEN_BALANCE
          : PaymentTiming.PAY_UPFRONT,
      depositPercent: pre.data.depositPercent,
      handoverMode:
        pre.data.handoverMode === "DELIVER"
          ? HandoverMode.DELIVER
          : HandoverMode.COLLECT,
    };
  }

  const slug = await uniqueMenuSlug(
    stand.id,
    String(formData.get("slug") ?? "").trim() || title,
  );

  const menu = await prisma.$transaction(async (tx) => {
    const created = await tx.menu.create({
      data: {
        standId: stand.id,
        ownerId: owner.id,
        title,
        slug,
        description,
        kind,
        isActive: formData.get("isActive") === "on",
        hideOnBusinessPage: formData.get("hideOnBusinessPage") === "on",
        showOnStand: formData.get("showOnStand") !== "off",
        showOnShop: formData.get("showOnShop") !== "off",
        ...(schedule
          ? {
              orderByAt: schedule.orderByAt,
              collectionAt: schedule.collectionAt,
              collectionNote: schedule.collectionNote,
              showExactStock: schedule.showExactStock,
              paymentTiming: schedule.paymentTiming,
              depositPercent: schedule.depositPercent,
              handoverMode: schedule.handoverMode,
            }
          : {}),
        items: {
          create: productIds.map((productId, i) => ({
            productId,
            sortOrder: i,
          })),
        },
      },
    });

    if (schedule) {
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isPreOrder: true,
          orderByAt: schedule.orderByAt,
          collectionAt: schedule.collectionAt,
          collectionNote: schedule.collectionNote,
          showExactStock: schedule.showExactStock,
          paymentTiming: schedule.paymentTiming,
          depositPercent: schedule.depositPercent,
          handoverMode: schedule.handoverMode,
        },
      });
    }

    return created;
  });

  if (kind === MenuKind.PREORDER_DROP) {
    try {
      const { syncMenuFulfilmentOption } = await import(
        "@/lib/fulfilment/sync-menu"
      );
      await syncMenuFulfilmentOption(menu.id);
    } catch (err) {
      console.error("Menu fulfilment sync failed", err);
    }
  }

  revalidatePath("/dashboard/menus");
  revalidatePath(`/s/${stand.slug}`);
  redirect(`/dashboard/menus/${menu.id}`);
}

export async function updateMenu(menuId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const existing = await prisma.menu.findFirst({
    where: { id: menuId, ownerId: owner.id },
    include: {
      items: { select: { productId: true } },
      stand: { select: { slug: true, timezone: true } },
    },
  });
  if (!existing) return { error: "Menu not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2 || title.length > 120) {
    return { error: "Enter a title (2–120 characters)." };
  }
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const kind =
    String(formData.get("kind") ?? "") === MenuKind.PREORDER_DROP
      ? MenuKind.PREORDER_DROP
      : MenuKind.ALWAYS_AVAILABLE;
  const productIds = productIdsFromForm(formData);
  if (productIds.length < 1) {
    return { error: "Select at least one product." };
  }

  const productsOk = await assertProductsAvailable({
    productIds,
    standId: existing.standId,
    ownerId: owner.id,
  });
  if ("error" in productsOk) return productsOk;

  let schedule: ReturnType<typeof scheduleFromMenu> = null;
  if (kind === MenuKind.PREORDER_DROP) {
    const clash = await assertNoScheduleClash(productIds, existing.id);
    if ("error" in clash) return clash;
    formData.set("isPreOrder", "true");
    const pre = parsePreOrderFromForm(
      formData,
      true,
      Boolean(owner.stripeAccountId && owner.stripeChargesEnabled),
      existing.stand.timezone,
    );
    if (!pre.ok) return { error: pre.error };
    if (!pre.data.isPreOrder) {
      return { error: "Set order-by and collection times for a pre-order drop." };
    }
    schedule = {
      isPreOrder: true,
      orderByAt: pre.data.orderByAt,
      collectionAt: pre.data.collectionAt,
      collectionNote: pre.data.collectionNote,
      showExactStock: pre.data.showExactStock,
      paymentTiming:
        pre.data.paymentTiming === "DEPOSIT_THEN_BALANCE"
          ? PaymentTiming.DEPOSIT_THEN_BALANCE
          : PaymentTiming.PAY_UPFRONT,
      depositPercent: pre.data.depositPercent,
      handoverMode:
        pre.data.handoverMode === "DELIVER"
          ? HandoverMode.DELIVER
          : HandoverMode.COLLECT,
    };
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  let slug = existing.slug;
  if (slugInput) {
    slug = await uniqueMenuSlug(existing.standId, slugInput, existing.id);
  }

  const removedIds = existing.items
    .map((i) => i.productId)
    .filter((id) => !productIds.includes(id));

  await prisma.$transaction(async (tx) => {
    await tx.menuProduct.deleteMany({ where: { menuId: existing.id } });
    await tx.menu.update({
      where: { id: existing.id },
      data: {
        title,
        slug,
        description,
        kind,
        isActive: formData.get("isActive") === "on",
        hideOnBusinessPage: formData.get("hideOnBusinessPage") === "on",
        showOnStand: formData.get("showOnStand") !== "off",
        showOnShop: formData.get("showOnShop") !== "off",
        ...(kind === MenuKind.ALWAYS_AVAILABLE
          ? {
              orderByAt: null,
              collectionAt: null,
              collectionNote: null,
              showExactStock: false,
              paymentTiming: PaymentTiming.PAY_UPFRONT,
              depositPercent: null,
              handoverMode: HandoverMode.COLLECT,
            }
          : schedule
            ? {
                orderByAt: schedule.orderByAt,
                collectionAt: schedule.collectionAt,
                collectionNote: schedule.collectionNote,
                showExactStock: schedule.showExactStock,
                paymentTiming: schedule.paymentTiming,
                depositPercent: schedule.depositPercent,
                handoverMode: schedule.handoverMode,
              }
            : {}),
        items: {
          create: productIds.map((productId, i) => ({
            productId,
            sortOrder: i,
          })),
        },
      },
    });

    if (schedule) {
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          isPreOrder: true,
          orderByAt: schedule.orderByAt,
          collectionAt: schedule.collectionAt,
          collectionNote: schedule.collectionNote,
          showExactStock: schedule.showExactStock,
          paymentTiming: schedule.paymentTiming,
          depositPercent: schedule.depositPercent,
          handoverMode: schedule.handoverMode,
        },
      });
    }

    if (removedIds.length > 0) {
      await clearOrphanedScheduleFlags(tx, removedIds);
    }
  });

  if (kind === MenuKind.PREORDER_DROP) {
    try {
      const { syncMenuFulfilmentOption } = await import(
        "@/lib/fulfilment/sync-menu"
      );
      await syncMenuFulfilmentOption(existing.id);
    } catch (err) {
      console.error("Menu fulfilment sync failed", err);
    }
  } else {
    await prisma.fulfilmentOption.deleteMany({ where: { menuId: existing.id } });
  }

  revalidatePath("/dashboard/menus");
  revalidatePath(`/dashboard/menus/${existing.id}`);
  revalidatePath(`/s/${existing.stand.slug}`);
  revalidatePath(standMenuDetailPath(existing.stand.slug, slug));
  return { ok: true as const };
}
