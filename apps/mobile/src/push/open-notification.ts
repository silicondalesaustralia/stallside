import { router } from "expo-router";
import { openOrder } from "@/lib/navigation";

const STOCK_TYPES = new Set(["low_stock", "sold_out", "supplier_stock"]);

function stringField(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Routes a tapped notification to the screen it's about. */
export function openNotification(data: Record<string, unknown>) {
  const type = stringField(data, "type");
  const orderId = stringField(data, "orderId");

  if (type === "sale" && orderId) {
    openOrder(orderId);
    return;
  }
  if ((type && STOCK_TYPES.has(type)) || stringField(data, "productId")) {
    router.navigate("/products");
    return;
  }
  router.navigate("/orders");
}
