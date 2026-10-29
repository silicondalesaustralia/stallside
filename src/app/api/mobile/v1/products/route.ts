import { productsQuery, type ProductsResponse } from "@/contracts/mobile/products";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { listStandProducts } from "@/lib/products/list";
import { toMobileProduct } from "@/lib/mobile/product-dto";
import { variantCountsFor } from "@/lib/product-variants/variant-counts";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, productsQuery);
  if (!query.ok) return query.response;

  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const products = await listStandProducts({
      ownerId: owner.id,
      standId: stand.value.id,
      tab: query.data.tab,
      q: query.data.q,
    });
    const variants = await variantCountsFor(products.map((p) => p.id));
    return mobileJson<ProductsResponse>({
      products: products.map((p) => toMobileProduct(p, variants.get(p.id) ?? 0)),
    });
  } catch (error) {
    return mobileServerError("Mobile products failed", error);
  }
}
