import type { ComposeOptionsResponse } from "@/contracts/mobile/communication";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadComposeOptions } from "@/lib/communication/load";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Customers, products, lists and pre-order pages a message can go to. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const o = await loadComposeOptions(guard.value.owner.id);
    return mobileJson<ComposeOptionsResponse>({
      customers: o.customers.map((c) => ({
        id: c.id,
        label: c.name ? `${c.name} (${c.email ?? ""})` : (c.email ?? "Customer"),
      })),
      products: o.products.map((p) => ({ id: p.id, label: p.name })),
      lists: o.lists.map((l) => ({ id: l.id, label: l.name })),
      preOrderPages: o.preOrderPages.map((p) => ({ id: p.id, label: p.title })),
    });
  } catch (error) {
    return mobileServerError("Mobile compose options failed", error);
  }
}
