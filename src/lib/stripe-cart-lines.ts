import type { CartLineData } from "@/lib/checkout";

/** Stripe line_items that sum exactly to each lineTotalCents (tier-safe). */
export function stripeLineItemsFromCart(
  lineData: CartLineData[],
  currency: string,
) {
  return lineData.map((line) => ({
    quantity: 1,
    price_data: {
      currency: currency.toLowerCase(),
      unit_amount: line.lineTotalCents,
      product_data: {
        name:
          line.quantity > 1
            ? `${line.productNameSnapshot}${
                line.optionsSnapshot ? ` (${line.optionsSnapshot})` : ""
              } × ${line.quantity}`
            : line.optionsSnapshot
              ? `${line.productNameSnapshot} (${line.optionsSnapshot})`
              : line.productNameSnapshot,
      },
    },
  }));
}
