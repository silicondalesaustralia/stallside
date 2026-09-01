import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  HandoverMode,
} from "@/generated/prisma/client";
import { readShopFulfilmentOptionFromCookies } from "@/lib/fulfilment/shop-option";
import { readShopOriginFromCookies } from "@/lib/storefront/shop-origin";
import {
  deliveryAddressMatchesZone,
  deliveryZoneMismatchMessage,
} from "@/lib/fulfilment/delivery-match";

type ResolvedOption = {
  id: string;
  kind: FulfilmentOptionKind;
  label: string;
  handoverMode: HandoverMode;
  deliveryFeeCents: number;
  minOrderCents: number;
};

export async function resolveShopFulfilmentForCheckout(input: {
  ownerId: string;
  cookieHeader?: string | null;
  productIds: string[];
  subtotalCents: number;
  deliverySuburb?: string;
  deliveryPostcode?: string;
}): Promise<
  | { option: ResolvedOption | null }
  | { error: string }
> {
  const optionId = readShopFulfilmentOptionFromCookies(input.cookieHeader);
  if (!optionId) {
    const shopOrigin = readShopOriginFromCookies(input.cookieHeader);
    if (shopOrigin) {
      const onlineCount = await prisma.fulfilmentOption.count({
        where: {
          ownerId: input.ownerId,
          isActive: true,
          channels: { has: "ONLINE" },
          kind: {
            in: [FulfilmentOptionKind.PICKUP, FulfilmentOptionKind.DELIVERY],
          },
        },
      });
      if (onlineCount > 1) {
        return {
          error:
            "Choose pickup or delivery on the shop before checkout.",
        };
      }
    }
    return { option: null };
  }

  const option = await prisma.fulfilmentOption.findFirst({
    where: {
      id: optionId,
      ownerId: input.ownerId,
      isActive: true,
      channels: { has: "ONLINE" },
      kind: {
        in: [FulfilmentOptionKind.PICKUP, FulfilmentOptionKind.DELIVERY],
      },
    },
    include: {
      deliveryZone: {
        include: { rules: { select: { kind: true, value: true } } },
      },
      products: {
        where: { productId: { in: input.productIds } },
        select: { productId: true, isEnabled: true },
      },
    },
  });

  if (!option) return { error: "Your pickup or delivery choice expired. Go back to the shop and choose again." };

  const eligibilityRows = await prisma.productFulfilmentOption.count({
    where: { fulfilmentOptionId: option.id },
  });
  if (eligibilityRows > 0) {
    const enabled = new Set(
      option.products.filter((p) => p.isEnabled).map((p) => p.productId),
    );
    for (const productId of input.productIds) {
      if (!enabled.has(productId)) {
        return {
          error: "Something in your cart isn't available for your chosen pickup or delivery option.",
        };
      }
    }
  }

  const minOrder =
    option.minOrderCents ||
    option.deliveryZone?.minOrderCents ||
    0;
  if (minOrder > 0 && input.subtotalCents < minOrder) {
    return {
      error: `Minimum order for this option is $${(minOrder / 100).toFixed(2)}.`,
    };
  }

  if (option.kind === FulfilmentOptionKind.DELIVERY) {
    const suburb = (input.deliverySuburb ?? "").trim();
    const postcode = (input.deliveryPostcode ?? "").trim();
    if (!suburb || !postcode) {
      return { error: "Enter a delivery address." };
    }
    const rules = option.deliveryZone?.rules ?? [];
    if (rules.length > 0 && !deliveryAddressMatchesZone(rules, suburb, postcode)) {
      return { error: deliveryZoneMismatchMessage() };
    }
  }

  const deliveryFeeCents =
    option.kind === FulfilmentOptionKind.DELIVERY
      ? option.feeCents || option.deliveryZone?.deliveryFeeCents || 0
      : 0;

  return {
    option: {
      id: option.id,
      kind: option.kind,
      label: option.label,
      handoverMode:
        option.kind === FulfilmentOptionKind.DELIVERY
          ? HandoverMode.DELIVER
          : HandoverMode.COLLECT,
      deliveryFeeCents,
      minOrderCents: minOrder,
    },
  };
}

/** Find linked pre-order fulfilment option for snapshotting. */
export async function findPreOrderFulfilmentOption(productIds: string[]) {
  if (productIds.length === 0) return null;
  const link = await prisma.preOrderPageProduct.findFirst({
    where: { productId: { in: productIds } },
    select: { preOrderPageId: true },
  });
  if (!link) return null;
  return prisma.fulfilmentOption.findFirst({
    where: { preOrderPageId: link.preOrderPageId },
    select: { id: true },
  });
}
