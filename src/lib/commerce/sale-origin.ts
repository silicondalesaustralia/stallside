import { SaleOrigin } from "@/generated/prisma/client";

/**
 * Vendl platform fee only on Vendl-originated online sales.
 * Square POS (and other observed external) sales never take the 2.5% fee.
 */
export function saleOriginIncursVendlFee(origin: SaleOrigin): boolean {
  return origin === SaleOrigin.VENDL_WEB || origin === SaleOrigin.FARM_STAND;
}

export function isObservedExternalSale(origin: SaleOrigin): boolean {
  return (
    origin === SaleOrigin.SQUARE_POS ||
    origin === SaleOrigin.MARKET ||
    origin === SaleOrigin.MANUAL
  );
}
