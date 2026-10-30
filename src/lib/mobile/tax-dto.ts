import type { TaxSettingsResponse } from "@/contracts/mobile/tax";
import { loadOwnerTaxSettings } from "@/lib/tax/owner-tax-settings";
import { TAX_REGIONS } from "@/lib/tax/regions";
import { loadTaxFreeProducts } from "@/lib/tax/tax-free-products";

const TAX_FREE_SHOWN = 12;

const percent = (bps: number | null) => (bps == null ? null : String(bps / 100));

/** Tax settings, country options and tax-free products, as on the web Tax page. */
export async function loadTaxSettingsResponse(ownerId: string): Promise<TaxSettingsResponse> {
  const [{ owner, country, region, status }, taxFree] = await Promise.all([
    loadOwnerTaxSettings(ownerId),
    loadTaxFreeProducts(ownerId, TAX_FREE_SHOWN),
  ]);
  const regions = TAX_REGIONS.some((r) => r.country === region.country) ? TAX_REGIONS : [...TAX_REGIONS, region];
  return {
    status,
    country,
    rate: percent(owner.taxRateBps) ?? "",
    taxId: owner.abn ?? "",
    registered: owner.gstRegistered,
    taxShipping: owner.taxShipping,
    regions: regions.map((r) => ({
      country: r.country,
      label: r.label,
      name: r.name,
      defaultRate: percent(r.defaultRateBps),
      inclusive: r.inclusive,
      idLabel: r.idLabel,
    })),
    taxFreeProducts: taxFree.products.map((p) => ({ id: p.id, name: p.name, standName: p.stand.name })),
    taxFreeTotal: taxFree.total,
  };
}
