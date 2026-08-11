import { dollarsToCents } from "@/lib/money";
import {
  parseAddonDiscountKind,
  type AddonDiscountKind,
} from "@/lib/preorder-upsell-pricing";

export type PreOrderAddonFormFields = {
  name: string | null;
  priceCents: number | null;
  discountKind: AddonDiscountKind | null;
  discountValue: number | null;
};

/** Parse pre-order add-on name, list price, and optional % / amount off. */
export function parsePreOrderAddonForm(
  formData: FormData,
): { ok: true; data: PreOrderAddonFormFields } | { ok: false; error: string } {
  const name =
    String(formData.get("preOrderUpsellName") ?? "").trim() || null;
  let priceCents: number | null = null;
  const priceRaw = String(formData.get("preOrderUpsellPrice") ?? "").trim();
  if (priceRaw) {
    try {
      priceCents = dollarsToCents(priceRaw);
    } catch {
      return { ok: false, error: "Invalid pre-order add-on price." };
    }
  }
  if (name && priceCents == null) {
    return { ok: false, error: "Enter a price for the pre-order add-on." };
  }
  if (!name && priceCents != null) {
    return { ok: false, error: "Enter a name for the pre-order add-on." };
  }

  const discountKind = parseAddonDiscountKind(
    String(formData.get("preOrderUpsellDiscountKind") ?? ""),
  );
  let discountValue: number | null = null;
  const offRaw = String(
    formData.get("preOrderUpsellDiscountValue") ?? "",
  ).trim();

  if (!name) {
    return {
      ok: true,
      data: {
        name: null,
        priceCents: null,
        discountKind: null,
        discountValue: null,
      },
    };
  }

  if (discountKind && offRaw) {
    if (discountKind === "PERCENT") {
      const n = Number.parseInt(offRaw, 10);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return { ok: false, error: "Discount percent must be 1-100." };
      }
      discountValue = n;
    } else {
      try {
        discountValue = dollarsToCents(offRaw);
      } catch {
        return { ok: false, error: "Invalid discount amount." };
      }
      if (discountValue <= 0) {
        return {
          ok: false,
          error: "Discount amount must be greater than zero.",
        };
      }
      if (priceCents != null && discountValue > priceCents) {
        return {
          ok: false,
          error: "Discount cannot exceed the add-on price.",
        };
      }
    }
  } else if (discountKind && !offRaw) {
    return { ok: false, error: "Enter a discount value, or choose None." };
  }

  return {
    ok: true,
    data: {
      name,
      priceCents,
      discountKind: discountValue != null ? discountKind : null,
      discountValue,
    },
  };
}
